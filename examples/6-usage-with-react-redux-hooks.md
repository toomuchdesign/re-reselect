## Usage with React Redux hooks

`useSelector` accepts any selector function, including a `re-reselect` selector.

With plain `reselect`, a selector keeps only its latest result. When several components call it with different arguments, they overwrite each other's result and the selector recomputes on every call. The [Redux docs](https://redux.js.org/usage/deriving-data-selectors#creating-unique-selector-instances) suggest creating one selector instance per component:

```js
import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { makeGetVisibleTodos } from '../selectors';

function VisibleTodoList({ listId }) {
  const getVisibleTodos = useMemo(makeGetVisibleTodos, []);
  const todos = useSelector((state) => getVisibleTodos(state, listId));
  // ...
}
```

`re-reselect` stores one `reselect` selector per `cacheKey`, so every component can call the same module-level selector.

#### `selectors/todoSelectors.js`

```js
import { createCachedSelector } from 're-reselect';

const getVisibilityFilter = (state, listId) =>
  state.todoLists[listId].visibilityFilter;

const getTodos = (state, listId) => state.todoLists[listId].todos;

const filterTodos = (visibilityFilter, todos) => {
  switch (visibilityFilter) {
    case 'SHOW_COMPLETED':
      return todos.filter((todo) => todo.completed);
    case 'SHOW_ACTIVE':
      return todos.filter((todo) => !todo.completed);
    default:
      return todos;
  }
};

export const getVisibleTodos = createCachedSelector(
  [getVisibilityFilter, getTodos],
  filterTodos,
)(
  (state, listId) => listId, // Cache a selector for each listId
);
```

#### `components/VisibleTodoList.js`

```js
import { useSelector } from 'react-redux';

import { getVisibleTodos } from '../selectors';

function VisibleTodoList({ listId }) {
  const todos = useSelector((state) => getVisibleTodos(state, listId));
  // ...
}
```

The selector returns the same array until the list's todos or filter change, so `useSelector` doesn't re-render the component.

Components with the same `listId` get the same cached result.

### Limit the cache size

Cached selectors stay in memory after the components that use them unmount. If there are many keys, use a [cache object](../src/cache/README.md) with a size limit:

```js
import { LruObjectCache, createCachedSelector } from 're-reselect';

export const getVisibleTodos = createCachedSelector(
  [getVisibilityFilter, getTodos],
  filterTodos,
)({
  keySelector: (state, listId) => listId,
  cacheObject: new LruObjectCache({ cacheSize: 50 }),
});
```

You can also remove an entry with `getVisibleTodos.removeMatchingSelector(state, listId)`.
