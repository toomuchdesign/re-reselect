---
're-reselect': minor
---

Add `createCachedSelector.withTypes<State>()` to create a pre-typed selector creator, mirroring reselect's `createSelector.withTypes` API.

This lets you set the `state` type once and reuse it across all `createCachedSelector` calls, removing the need to annotate `state` on every input selector:

```ts
const createAppCachedSelector = createCachedSelector.withTypes<RootState>();
```

Runtime behavior is unchanged: `withTypes` only refines the static types and returns the same creator.
