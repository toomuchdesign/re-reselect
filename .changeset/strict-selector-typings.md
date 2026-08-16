---
're-reselect': major
---

Rewrite re-reselect in native TypeScript.

The internals were migrated from JavaScript with a hand-maintained `index.d.ts` (~4500 lines of manual per-arity type overloads) to native `.ts` sources whose type declarations are generated automatically at build time. Build tooling moved from Rollup + Babel to `tsdown` (rolldown), and the type layer now derives everything from reselect v5-style variadic-tuple inference instead of hand-written overloads.

The public runtime API is preserved: the same two factories (`createCachedSelector`, `createStructuredCachedSelector`) and six cache classes are exported, with working CJS, ESM and UMD bundles, and `reselect` still resolved as a `^5.0.0` peer dependency.

The stricter, inferred type layer introduces the following **type-level breaking changes**, which may surface as compile errors for strict-mode TypeScript consumers (runtime is unaffected):

- The cached selector's call signature is now a precise tuple inferred from the input selectors, instead of `(state, props, ...args: any[])`. Passing excess positional arguments is no longer accepted.
- The cached selector's parameters must match the union of all input selectors' parameters. Under-supplying arguments declared by an input selector is no longer accepted.
- `resetRecomputations()` is now typed as `() => void` (aligned with reselect v5) instead of `() => number`.

### Removed and changed type exports

The hand-written type overrides were replaced by reselect v5-style inference, so several exported types were removed or changed. Most of them mirrored reselect's own types; re-reselect no longer re-exports them, since `reselect` is a peer dependency you can import from directly.

**Removed — import from `reselect` instead:**

```ts
// before: import type { Selector, OutputSelector } from 're-reselect';
import type { OutputSelector, Selector } from 'reselect';
```

`Selector`, `OutputSelector`, and `CreateSelectorInstance` (use reselect's `CreateSelectorFunction`).

**Removed — the parametric variants no longer exist.** reselect v5 folds "parametric" into the params tuple of a single `Selector`/`OutputSelector` type, so these have no replacement to import — express the props via the tuple instead:

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
