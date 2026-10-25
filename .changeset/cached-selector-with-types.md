---
're-reselect': minor
---

Add `createCachedSelector.withTypes<State>()`, a pre-typed selector creator that mirrors reselect's `createSelector.withTypes`.

Set the `state` type once and reuse it across every `createCachedSelector` call, so you no longer annotate `state` on each input selector:

```ts
const createAppCachedSelector = createCachedSelector.withTypes<RootState>();
```

Pass the input selectors as an array. As with reselect, the variadic form infers `state` as `any`.

`withTypes` only changes types. At runtime it returns the same `createCachedSelector`.
