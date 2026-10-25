---
're-reselect': major
---

Rewrite re-reselect in native TypeScript.

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
