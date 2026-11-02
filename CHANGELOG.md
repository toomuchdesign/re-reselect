# re-reselect

## 6.0.0

### Major Changes

- [#494](https://github.com/toomuchdesign/re-reselect/pull/494) [`2ecc799`](https://github.com/toomuchdesign/re-reselect/commit/2ecc79985ccec2ba3ceaca098cc939d7aa7094be) - Rewrite re-reselect in native TypeScript.

  re-reselect moved from JavaScript with a hand-maintained `index.d.ts` (~4500 lines of per-arity overloads) to `.ts` sources. The build generates the type declarations, which use reselect v5's variadic-tuple inference instead of hand-written overloads. `tsdown` (rolldown) replaces Rollup + Babel.

  The runtime API is unchanged. re-reselect still exports the same two factories (`createCachedSelector`, `createStructuredCachedSelector`) and six cache classes, as CJS and ESM bundles.

  ### Runtime behavior changes
  - `resetRecomputations()` now returns `undefined` instead of `0` and is typed `() => void` (aligned with reselect v5). Use `recomputations()` to read the count.
  - A missing `keySelector` now throws when the selector is created, not on the first call. `createCachedSelector(...)({ cacheObject })` used to build a selector that threw a `TypeError` only when called. Now the factory throws `[re-reselect] Missing "keySelector"`. Selectors usually live at module scope, so a selector already broken this way now fails at import time.
  - re-reselect passes an invalid `cacheKey` through `String()` before writing the warning. Previously a `symbol` cacheKey made the warning itself throw a `TypeError`.
  - The cache lookup treats any falsy value returned by a custom `cacheObject.get()` as a miss, rather than only `undefined`. A cache object that returns `null` for a miss now works instead of crashing.

  ### Type changes

  The inferred type layer is stricter. Most of the changes below show up as compile errors in strict-mode projects; the one about unannotated input selectors weakens inference without an error.

  - Explicit type arguments no longer match. The per-arity generics (`createCachedSelector<S, R1, T>`, `createCachedSelector<S, P, R1, R2, T>`, `createStructuredCachedSelector<M, S, P>`, …) are gone. `createCachedSelector` now takes `<InputSelectors, Result>` and `createStructuredCachedSelector` takes `<InputSelectorsObject>`, so old calls fail with `TS2558`. Drop the type arguments and annotate `state` and params on the input selectors, or pass the new type arguments (`createCachedSelector<[typeof selectA, typeof selectB], Result>(…)`).
  - The cached selector's call signature is now inferred from the input selectors, instead of `(state, props, ...args: any[])`. reselect's `MergeParameters` merges the input selectors' parameters position by position. TypeScript now rejects excess arguments and missing arguments that an input selector declares. If two input selectors declare incompatible types at the same position, that argument becomes `never`. `getMatchingSelector` and `removeMatchingSelector` take the same arguments.
  - An inline input selector without a `state` annotation, mixed with annotated ones, now infers `state` as `any`, and that `any` reaches the combiner and the result. The previous hand-written `.d.ts` inferred it from the other input selectors. This is the same inference reselect v5's `createSelector` does. Annotate `state` on every inline input selector, or use `createCachedSelector.withTypes<State>()` with input selectors passed as an array.
  - `getMatchingSelector()` is now typed as returning `OutputSelector<…> | undefined` instead of `OutputSelector<…>`. It has always returned `undefined` at runtime when no selector is cached for the given arguments (not called yet, removed with `removeMatchingSelector`/`clearCache`, or evicted by a size-limited cache). With `strictNullChecks`, check the result or use optional chaining: `selector.getMatchingSelector(state, id)?.recomputations()`.
  - The `keySelector` parameter list is now inferred from the input selectors (`(state, ...params)`) instead of the permissive `(state, ...args: any[])`. A `keySelector` that reads an extra argument not declared by any input selector no longer type-checks. This is the "cache dimension supplied via `keySelector` only" pattern. Express the dimension as a parametric input selector (`(state, id) => id`) so it flows into both the call signature and the `keySelector`. Runtime behavior is unchanged.
  - `keySelectorCreator` now receives `keySelector` as an optional property (`keySelector?: TypedKeySelector<InputSelectors>`), because it is absent when `keySelectorCreator` is used on its own. Existing creators that call it directly need a guard or a non-null assertion:

    ```ts
    // before
    ({ keySelector }) =>
      (state, id) =>
        keySelector(state, id);
    // after
    ({ keySelector }) =>
      (state, id) =>
        keySelector?.(state, id) ?? id;
    ```

  - The keySelector returned by `keySelectorCreator` is now typed `TypedKeySelector<InputSelectors>` instead of `(state, ...args: any[]) => any`, so it follows the same rule as `keySelector` and can't read an argument no input selector declares. With input selectors taking `(state, id)`, a creator returning `(state, id, page) => …` no longer type-checks. Move `page` into a parametric input selector.
  - `createStructuredCachedSelector` with a very large selectors object (roughly 50+ keys) may fail to type-check with `TS2589` "Type instantiation is excessively deep". reselect v5's own `createStructuredSelector` has the same limit, because both derive a tuple from the object type. The old hand-written `.d.ts` avoided it with non-recursive mapped types. Runtime behavior is unchanged. Split the object into smaller structured selectors, or compose plain `createCachedSelector` calls.

  ### Removed and changed type exports

  Several exported types were removed or changed. Most mirrored reselect's own types; import those from `reselect`, which is a peer dependency.

  **Removed. Import from `reselect` instead:**

  ```ts
  // before: import type { Selector, OutputSelector } from 're-reselect';
  import type { OutputSelector, Selector } from 'reselect';
  ```

  `Selector`, `OutputSelector`, and `CreateSelectorInstance` (use reselect's `CreateSelectorFunction`).

  **Removed. The parametric variants no longer exist.** reselect v5 folds "parametric" into the params tuple of a single `Selector`/`OutputSelector` type, so these have no replacement to import. Express the props via the tuple instead:

  | Removed                                     | Replacement                                            |
  | ------------------------------------------- | ------------------------------------------------------ |
  | `ParametricSelector<S, P, R>`               | `Selector<S, R, [P]>`                                  |
  | `OptionalParametricSelector<S, P, R>`       | `Selector<S, R, [P?]>`                                 |
  | `OutputParametricSelector<…>`               | let inference produce `OutputSelector<[...inputs], R>` |
  | `OutputOptionalParametricSelector<…>`       | let inference produce `OutputSelector<[...inputs], R>` |
  | `OutputParametricCachedSelector<…>`         | see `OutputCachedSelector` below                       |
  | `OutputOptionalParametricCachedSelector<…>` | see `OutputCachedSelector` below                       |
  | `ParametricKeySelector<S, P>`               | `KeySelector<S>` / `TypedKeySelector<Inputs>`          |
  | `ParametricKeySelectorCreator<…>`           | `KeySelectorCreator<Inputs, Result>`                   |

  **Changed arity** (aligned with reselect v5, which keys these on the input-selector array instead of `State`):

  - `KeySelectorCreator<S, C, D>` → `KeySelectorCreator<InputSelectors, Result>`

  **`OutputCachedSelector` now types the selector, not the factory.** It used to type the factory that `createCachedSelector(...)` returns, which takes a `keySelector` or options object. It now types the cached selector that factory returns, the same way reselect's `OutputSelector` types what `createSelector` returns. Its type arguments change to match reselect v5, from `OutputCachedSelector<S, R, C, D>` to `OutputCachedSelector<InputSelectors, Result>`. Move the annotation from the factory to the selector:

  ```ts
  // before
  const makeSelectUser: OutputCachedSelector<State, User, Combiner, Deps> =
    createCachedSelector(selectUsers, selectId, (users, id) => users[id]);
  const selectUser = makeSelectUser((state, id) => id);

  // after
  const selectUser: OutputCachedSelector<
    [typeof selectUsers, typeof selectId],
    User
  > = createCachedSelector(
    selectUsers,
    selectId,
    (users, id) => users[id],
  )((state, id) => id);
  ```

  ### Packaging changes

  The package now ships a standard `exports` map with separate `import` (ESM) and `require` (CJS) conditions, each pointing at its own type declarations.

  - **The `reselect` peer dependency is now `^5.1.0`.** The generated types import `SelectorsObject`, `SelectorResultsMap` and the generic `SelectorArray<State>` / `CreateSelectorFunction<..., StateType>`, which reselect 5.0.x doesn't export. Runtime still works with 5.0.x.
  - **Deep imports into `dist` are no longer resolvable.** The package exposes only its root (`re-reselect`) and `re-reselect/package.json`. Import from the package root instead of paths like `re-reselect/dist/...`.
  - **The UMD build and the `browser` field have been removed.** re-reselect no longer ships a `dist/umd/` bundle (reselect v5 dropped its own UMD build too). Any consumer loading re-reselect straight from a CDN via a `<script>` tag (`unpkg`, jsDelivr) or resolving the old `browser` field must switch to the ESM or CJS build. Use an ESM CDN such as `https://esm.sh/re-reselect`, or bundle re-reselect as part of an app build.
  - **The ESM build is now `dist/es/index.mjs`** (was `dist/es/index.js`), reached through the `import` condition, so native Node ESM loads it as a real ES module.
  - **Default imports no longer work in native Node ESM.** re-reselect has never had a default export, but `import reReselect from 're-reselect'` used to load the CJS build through Node's interop and return the module object. Node now loads the real ES module, so the import fails with `does not provide an export named 'default'`. Use named imports or `import * as reReselect from 're-reselect'`.
  - **The `module` field points at a separate `dist/es/index.legacy-esm.js`.** Old bundlers such as webpack 4 read `module`, not `exports`. They treat a `.mjs` file as strict ESM that can't re-export reselect's named bindings, so they get a `.js` legacy-ESM entry instead, like reselect's own `reselect.legacy-esm.js`. Node uses the `import` condition and never loads this file.
  - **The bundles are no longer ES5.** Babel compiled v5 to ES5. The CJS and `.mjs` builds now use ES2020 syntax (`class`, `?.`, `??`, object spread) and the legacy-ESM build uses ES2019, matching reselect v5. Apps that target older engines must transpile `node_modules`.
  - **Type declarations moved.** The `import` condition resolves to `dist/es/index.d.mts` and the `require` condition to `dist/cjs/index.d.ts`, which the top-level `types` field also points at. Consumers resolving types through the package name are unaffected.

### Minor Changes

- [#494](https://github.com/toomuchdesign/re-reselect/pull/494) [`2ecc799`](https://github.com/toomuchdesign/re-reselect/commit/2ecc79985ccec2ba3ceaca098cc939d7aa7094be) - Add `createCachedSelector.withTypes<State>()`, a pre-typed selector creator that mirrors reselect's `createSelector.withTypes`.

  Set the `state` type once and reuse it across every `createCachedSelector` call, so you no longer annotate `state` on each input selector:

  ```ts
  const createAppCachedSelector = createCachedSelector.withTypes<RootState>();
  ```

  Pass the input selectors as an array. As with reselect, the variadic form infers `state` as `any`.

  `withTypes` only changes types. At runtime it returns the same `createCachedSelector`.

## 5.1.1

### Patch Changes

- [#477](https://github.com/toomuchdesign/re-reselect/pull/477) [`8a98e4d`](https://github.com/toomuchdesign/re-reselect/commit/8a98e4d5ed0562914b12bd1049ba40069a7e28a5) Thanks [@veksa](https://github.com/veksa)! - Fix `createStructuredCachedSelector` type error when a selector has a second optional argument

## 5.0.0

### New Features

- Support `reselect` v5

### Breaking Changes

- Drop support for `reselect` v4 -
- Remove `createCachedSelector` default export

## 4.0.1

- omit `clearCache` from `CreateSelectorInstance` type

## 4.0.0

### Breaking Changes

- Drop support for `createCachedSelector(...)(arguments)` call with multiple arguments
- Drop legacy `FifoCacheObject`, `FlatCacheObject`, `LruCacheObject` exports
- TypeScript typings of `createStructuredSelector` have been changed. Explicitly setting `State` and `Parameter` types is no longer required (nor possible), please update the typings as follows if necessary:

```typescript
// Before:
const selector = createStructuredCachedSelector<State, string>({
  x: (state, id) => state.a[id],
})((state, id) => id);
// After:
const selector = createStructuredCachedSelector({
  x: (state: State, id: string) => state.a[id],
})((state, id) => id);
```

### New Features

- Provide auto inferring to `createStructuredSelector` typings
- Expose `createCachedSelector` as both default and named export

## 3.4.0

### New Features

- Introduce single argument signature

## 3.3.0

### New Features

- Add `keySelectorCreator` option

## 3.2.0

### New Features

- Add `createStructuredCachedSelector`

## 3.1.0

### New Features

- Expose `keySelector` property

## 3.0.0

### Breaking Changes

- Update TypeScript typings
  - Introduce typings for heterogeneous selectors
  - Introduce typings for any number of uniform selectors
  - Rename "resolver" as "keySelector"

### New Features

- Update TypeScript typings
  - Introduce typings for `dependencies` property

## 2.3.0

### New Features

- Do not include test files on publish
- Introduce new selectors' methods/properties:
  - `dependencies` property
  - `recomputations` method
  - `resetRecomputations` method

## 2.2.0

- Fix cache object's `isValidCacheKey` method TS type definition

### New Features

- Upgrade to babel 7
- Update dev dependencies

### Breaking Changes (not considered worth a major release)

`Babel 7` in `loose` mode [doesn't add anymore `classCallCheck` utility to transpiled ES classes](https://babeljs.io/blog/2018/08/27/7.0.0#output-options). Cache object classes instantiated by mistake without new operator will now fail silently.

## 2.1.0

### New Features

- Expose `cache` property

## 2.0.0

### Breaking Changes

- `cacheKey` values no more restricted by default to `number` or `string`
- `cacheKey` validation delegated to `cacheObject`'s `isValidCacheKey` method
- `selectorCreator` argument removed in favour of `options` object
- `console.warn` when `resolverFunction` returns invalid `cacheKey`
- `cacheObject` export names renamed _(old ones are deprecated)_:
  - `FlatCacheObject` -> `FlatObjectCache`
  - `FifoCacheObject` -> `FifoObjectCache`
  - `LruCacheObject` -> `LruObjectCache`

### New Features

- Added 3 new `cacheObject` implementations using `ES Map` objects accepting any value as `cacheKey`:
  - `FlatMapCache`
  - `FifoMapCache`
  - `LruMapCache`
- Add a `sideEffects: false` flag for Webpack 4

## 1.0.1

- Remove wrong line at the beginning of the docs

## 1.0.0

### Breaking Changes

- `selectorCreator` argument is deprecated in favour of an option object

### New Features

- Accept an option object to provide `cacheObject` and `selectorCreator` options
- Extract caching logic into pluggable/customizable cache objects
- Introduce `Rollup.js` as bundler
- Make compilation cross-platform

## 0.6.3

- Add TS type definition for optional `selectorCreator`

## 0.6.2

- Fix wrong UMD reselect global import

## 0.6.1

- Fix TypeScript `OutputCachedSelector` and `OutputParametricCachedSelector` type definitions

## 0.6.0

- Add TypeScript type definitions

## 0.5.0

- Expose `resultFunc` attribute

## 0.4.0

- Expose `removeMatchingSelector` method
- Expose `clearCache` method

## 0.3.0

- Add UMD dist

## 0.2.0

- Expose `getMatchingSelector` method to retrieve the instance of cached selectors

## 0.1.0

- Allow resolver function to return keys of type number

## 0.0.0

- Initial release
