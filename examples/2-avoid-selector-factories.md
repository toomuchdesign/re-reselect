## Avoid selector factories

This example shows how `re-reselect` would solve the scenario described in [Reselect docs](https://github.com/reactjs/reselect#sharing-selectors-with-props-across-multiple-components): **_how to share a selector across multiple components while passing in props and retaining memoization?_**

Using `re-reselect` you can directly declare `getVisibleTodos` selector. Since `re-reselect` handles selectors instantiation transparently, there is no need to declare a `makeGetVisibleTodos` factory.

#### `selectors/todoSelectors.js`

```js
import createCachedSelector from 're-reselect';

const getVisibilityFilter = (state, props) =>
  state.todoLists[props.listId].visibilityFilter;

const getTodos = (state, props) => state.todoLists[props.listId].todos;

const getVisibleTodos = createCachedSelector(
  [getVisibilityFilter, getTodos],
  (visibilityFilter, todos) => {
    switch (visibilityFilter) {
      case 'SHOW_COMPLETED':
        return todos.filter(todo => todo.completed);
      case 'SHOW_ACTIVE':
        return todos.filter(todo => !todo.completed);
      default:
        return todos;
    }
  }
)(
  /*
                     * Re-reselect resolver function.
                     * Cache/call a new selector for each different "listId"
                     */
  (state, props) => props.listId
);

export default getVisibleTodos;
```

#### `containers/VisibleTodoList.js`

```js
import {connect} from 'react-redux';
import {toggleTodo} from '../actions';
import TodoList from '../components/TodoList';
import {getVisibleTodos} from '../selectors';

// No need of makeMapStateToProps function:
// use getVisibleTodos as a normal selector
const mapStateToProps = (state, props) => {
  return {
    todos: getVisibleTodos(state, props),
  };
};

// ...
```
