---
're-reselect': major
---

Stricter selector typings after migration to native TypeScript sources (reselect v5-style inference).

Runtime behavior is unchanged; the following are type-level breaking changes that may surface as compile errors for strict-mode TypeScript consumers:

- The cached selector's call signature is now a precise tuple inferred from the input selectors, instead of `(state, props, ...args: any[])`. Passing excess positional arguments is no longer accepted.
- The cached selector's parameters must match the union of all input selectors' parameters. Under-supplying arguments declared by an input selector is no longer accepted.
- `resetRecomputations()` is now typed as `() => void` (aligned with reselect v5) instead of `() => number`.
