---
're-reselect': major
---

Rewrite re-reselect in native TypeScript.

The internals moved from JavaScript with a hand-maintained `index.d.ts` (~4500 lines of manual per-arity type overloads) to native `.ts` sources whose type declarations are generated at build time. Build tooling moved from Rollup + Babel to `tsdown` (rolldown), and the type layer now derives everything from reselect v5-style variadic-tuple inference instead of hand-written overloads.

The runtime value API is unchanged: the same two factories (`createCachedSelector`, `createStructuredCachedSelector`) and six cache classes are exported, with working CJS, ESM and UMD bundles, and `reselect` still resolved as a `^5.0.0` peer dependency.

**Runtime behavior change.** `resetRecomputations()` now returns `undefined` instead of `0` (aligned with reselect v5). Use `recomputations()` to read the count.

The stricter, inferred type layer introduces the following type-level breaking changes, which may appear as compile errors for strict-mode TypeScript consumers:

- The cached selector's call signature is now a precise tuple inferred from the input selectors, instead of `(state, props, ...args: any[])`. Passing excess positional arguments is no longer accepted.
- The cached selector's parameters must match the union of all input selectors' parameters. Under-supplying arguments declared by an input selector is no longer accepted.
- `resetRecomputations()` is now typed as `() => void` (aligned with reselect v5) instead of `() => number`.
- The `keySelector` parameter list is now inferred from the input selectors (`(state, ...params)`) instead of the permissive `(state, ...args: any[])`. A `keySelector` that reads an extra argument not declared by any input selector no longer type-checks. This is the "cache dimension supplied via `keySelector` only" pattern. Express the dimension as a parametric input selector (`(state, id) => id`) so it flows into both the call signature and the `keySelector`. Runtime behavior is unchanged.
- `createStructuredCachedSelector` with a very large selectors object (roughly 50+ keys) may fail to type-check with `TS2589` "Type instantiation is excessively deep". This is inherited from reselect v5's own `createStructuredSelector`, which uses the same object-to-tuple type derivation; the previous hand-written `.d.ts` avoided it via non-recursive mapped types. Runtime behavior is unchanged. Workaround: split into smaller structured selectors, or compose plain `createCachedSelector` calls.

### Removed and changed type exports

reselect v5-style inference now replaces the hand-written type overrides, so several exported types were removed or changed. Most mirrored reselect's own types, so re-reselect no longer re-exports them; import them from `reselect` directly, since it's a peer dependency.

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
| `OutputParametricCachedSelector<…>`         | `OutputCachedSelector<[...inputs], R>`                 |
| `OutputOptionalParametricCachedSelector<…>` | `OutputCachedSelector<[...inputs], R>`                 |
| `ParametricKeySelector<S, P>`               | `KeySelector<S>` / `TypedKeySelector<Inputs>`          |
| `ParametricKeySelectorCreator<…>`           | `KeySelectorCreator<Inputs, Result>`                   |

**Changed arity** (aligned with reselect v5, which keys these on the input-selector array instead of `State`):

- `OutputCachedSelector<S, R, C, D>` → `OutputCachedSelector<InputSelectors, Result>`
- `KeySelectorCreator<S, C, D>` → `KeySelectorCreator<InputSelectors, Result>`

### Packaging changes

The package now ships a standard `exports` map with separate `import` (ESM) and `require` (CJS) conditions, each pointing at its own type declarations. Consequences:

- **Deep imports into `dist` are no longer resolvable.** Only the package root (`re-reselect`) and `re-reselect/package.json` are exposed. Import from the package root instead of paths like `re-reselect/dist/...`.
- **The ESM build is now `dist/es/index.mjs`** (was `dist/es/index.js`), so native Node ESM loads it as a real ES module. The `module` field now points at it.
- **Type declarations moved.** The `import` condition resolves to `dist/es/index.d.mts` and the `require` condition to `dist/cjs/index.d.ts`; the top-level `types` field points at the latter. Consumers resolving types through the package name are unaffected.

The importable value API (`re-reselect` root, CJS/ESM/UMD) is unchanged.
