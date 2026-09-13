---
're-reselect': minor
---

Add `createCachedSelector.withTypes<State>()`, a pre-typed selector creator that mirrors reselect's `createSelector.withTypes`.

Set the `state` type once and reuse it across every `createCachedSelector` call, so you no longer annotate `state` on each input selector:

```ts
const createAppCachedSelector = createCachedSelector.withTypes<RootState>();
```

Types only. `withTypes` refines the static types and returns the same creator, so runtime behavior does not change.
