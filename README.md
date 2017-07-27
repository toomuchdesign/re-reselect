# Re-reselect [![Build Status][ci-img]][ci]

Improve **[Reselect][reselect] selectors performance** on a few edge cases, by initializing selectors on runtime, using a **memoized factory**.

**Re-reselect returns a reselect-like selector**, which is able to determine internally when **querying a new selector instance or a cached one** on the fly, depending on the supplied arguments.

Useful to **reduce selectors recalculation** when:
- a selector is sequentially **called with one/few different arguments**
- a selector is **imported by different modules** at the same time
- **sharing selectors** with props across multiple components (see [reselect example](https://github.com/reactjs/reselect#sharing-selectors-with-props-across-multiple-components) and [re-reselect solution](https://github.com/toomuchdesign/re-reselect#how-to-share-a-selector-across-multiple-components-while-passing-in-props-and-retaining-memoization))
- selectors need to be **instantiated on runtime**

[reselect]:    https://github.com/reactjs/reselect
[ci-img]:      https://travis-ci.org/toomuchdesign/re-reselect.svg
[ci]:          https://travis-ci.org/toomuchdesign/re-reselect

```js
import createCachedSelector from 're-reselect';

const selectorA = state => state.a;
const selectorB = state => state.b;

const cachedSelector = createCachedSelector(
    // Set up your Reselect selector as normal:

    // reselect inputSelectors:
    selectorA,
    selectorB,
    (state, someArg) => someArg,

    // reselect resultFunc:
    (A, B, someArg) => expensiveComputation(A, B, someArg),
)(
    /*
     * Now it comes the re-reselect caching part:
     * declare a resolver function, used as mapping cache key.
     * It takes the same arguments as the generated selector
     * and must return a string or number (the cache key).
     *
     * A new selector will be cached for each different returned key
     *
     * In this example the second argument of the selector is used as cache key
     */
    (state, someArg) => someArg,
);

// Now you are ready to call/expose the cached selector like a normal selector:

/*
 * Call selector with "foo" and with "bar":
 * 2 different selectors are created, called and cached behind the scenes.
 * The selectors return their computed result.
 */
const fooResult = cachedSelector(state, 'foo');
const barResult = cachedSelector(state, 'bar');

/*
 * Call selector with "foo" again:
 * "foo" hits the cache, now: the selector cached under "foo" key
 * is retrieved, called again and the result is returned.
 */
const fooResultAgain = cachedSelector(state, 'foo');

/*
 * Note that fooResult === fooResultAgain.
 * The cache was not invalidated by "cachedSelector(state, 'bar')" call
 */
```

## Table of contents
- [Installation](#installation)
- [Why? + example](#why--example)
  - [Re-reselect solution](#re-reselect-solution)
  - [Other viable solutions](#other-viable-solutions)
- [FAQ](#faq)
  - [How do I wrap my existing selector with re-reselect?](#how-do-i-wrap-my-existing-selector-with-re-reselect)
  - [How to share a selector across multiple components while passing in props and retaining memoization?](#how-to-share-a-selector-across-multiple-components-while-passing-in-props-and-retaining-memoization)
  - [How do I test a re-reselect selector?](#how-do-i-test-a-re-reselect-selector)
- [API](#api)
  - [`reReselect`](#rereselectreselects-createselector-argumentsresolverfunction-selectorcreator--selectorcreator)
  - [reReselectInstance`()`](#rereselectinstanceselectorarguments)
  - [reReselectInstance`.getMatchingSelector`](#rereselectinstancegetmatchingselectorselectorarguments)
  - [reReselectInstance`.removeMatchingSelector`](#rereselectinstanceremovematchingselectorselectorarguments)
  - [reReselectInstance`.clearCache`](#rereselectinstanceclearcache)
  - [reReselectInstance`.resultFunc`](#rereselectinstanceresultfunc)

## Installation
```console
npm install reselect
npm install re-reselect
```

## Why? + example
I found my self wrapping a library of data elaboration (quite heavy stuff) with reselect selectors (`getPieceOfData` in the example).

On each store update, I had to repeatedly call the selector in order to retrieve all the pieces of data needed by my UI. Like this:

```js
getPieceOfData(state, itemId, 'dataA', otherArg);
getPieceOfData(state, itemId, 'dataB', otherArg);
getPieceOfData(state, itemId, 'dataC', otherArg);
```
What happens, here? `getPieceOfData` **selector cache is invalidated** on each call because of the changing 3rd `dataX` argument.

### Re-reselect solution
`createCachedSelector` keeps a private collection of selectors and store them by `key`.

`key` is the output of the `resolver` function, declared at selector initialization.

`resolver` is a custom function which receives the same arguments as the final selector (in the example: `state`, `itemId`, `'dataX'`, `otherArgs`) and returns a `string` or `number`.

That said, I was able to configure `re-reselect` to retrieve my data by querying a set of cached selectors using the 3rd argument as cache key:

```js
const getPieceOfData = createCachedSelector(
  state => state,
  (state, itemId) => itemId
  (state, itemId, dataType) => dataType
  (state, itemId, dataType, otherArg) => otherArg
  (state, itemId, dataType, otherArg) => expensiveComputation(state, itemId, dataType, otherArg),
)(
  (state, itemId, dataType) => dataType,    // Memoize by dataType
);
```
The final result is a normal selector taking the same arguments as before.

But now, **each time the selector is called**, the following happens behind the scenes:
- Run `resolver` function and get its result (the cache key)
- Look for a matching key from the cache
- Return a cached selector or create a new one if no matching key is found in cache
- Call selector with provided arguments

**Re-reselect** stays completely optional and uses **your installed reselect** library under the hoods (reselect is declared as a **peer dependency**).

Furthermore you can use any custom selector (see [API](#api)).

### Other viable solutions

#### 1- Declare a different selector for each different call
Easy but doesn't scale.

#### 2- Declare a `makeGetPieceOfData` selector factory as explained in [Reselect docs](https://github.com/reactjs/reselect/tree/v2.5.4#sharing-selectors-with-props-across-multiple-components)

Fine, but has 2 downsides:
- Bloat your selectors module by exposing both `get` selectors and `makeGet` selector factories
- Two different selector instances given the same arguments will individually recompute and store the same result (read [this](https://github.com/reactjs/reselect/pull/213))

#### 3- Wrap your `makeGetPieceOfData` selector factory into a memoizer function and call the returning memoized selector

This is what **re-reselect** actually does. It's quite verbose (since should be repeated for each selector), that's why re-reselect is here.

## FAQ
### How do I wrap my existing selector with re-reselect?
Given your `reselect` selectors:

```js
import { createSelector } from 'reselect';

export const getMyData = createSelector(
  selectorA,  // eg: selectors receive: (state, arg1, arg2)
  selectorB,
  selectorC,
  (A, B, C) => doSomethingWith(A, B, C),
);
```

...it becomes:
```js
import createCachedSelector from 're-reselect';

export const getMyData = createCachedSelector(
  selectorA,  // eg: selectors receive: (state, arg1, arg2)
  selectorB,
  selectorC,
  (A, B, C) => doSomethingWith(A, B, C),
)(
  (state, arg1, arg2) => arg2,   // Use arg2 as cache key
);
```
Voilà, `getMyData` is ready for use!
```js
let myData = getMyData(state, 'foo', 'bar');

```

### How to share a selector across multiple components while passing in props and retaining memoization?
This example is how `re-reselect` would solve the scenario described in [Reselect docs](https://github.com/reactjs/reselect#sharing-selectors-with-props-across-multiple-components).

We can directly declare `getVisibleTodos` selector. Since `re-reselect` handles selectors instantiation transparently, there is no need to declare a `makeGetVisibleTodos` factory.

#### `selectors/todoSelectors.js`

```js
import createCachedSelector from 're-reselect';

const getVisibilityFilter = (state, props) =>
  state.todoLists[props.listId].visibilityFilter

const getTodos = (state, props) =>
  state.todoLists[props.listId].todos

const getVisibleTodos = createCachedSelector(
  [ getVisibilityFilter, getTodos ],
  (visibilityFilter, todos) => {
    switch (visibilityFilter) {
      case 'SHOW_COMPLETED':
        return todos.filter(todo => todo.completed)
      case 'SHOW_ACTIVE':
        return todos.filter(todo => !todo.completed)
      default:
        return todos
    }
  }
)(
  /*
   * Re-reselect resolver function.
   * Cache/call a new selector for each different "listId"
   */
  (state, props) => props.listId,
);

export default getVisibleTodos;
```

#### `containers/VisibleTodoList.js`
```js
import { connect } from 'react-redux'
import { toggleTodo } from '../actions'
import TodoList from '../components/TodoList'
import { getVisibleTodos } from '../selectors'

// No need of makeMapStateToProps function:
// use getVisibleTodos as a normal selector
const mapStateToProps = (state, props) => {
  return {
    todos: getVisibleTodos(state, props)
  }
}

// ...
```

### How do I test a re-reselect selector?
Just like a normal reselect selector! Read more [here](https://github.com/reactjs/reselect#q-how-do-i-test-a-selector).

Each **re-reselect** cached selector exposes a `getMatchingSelector` method which returns the **underlying matching selector** instance for the given arguments, **instead of the result**.

`getMatchingSelector` expects the same arguments as a normal selector call **BUT returns the instance of the cached selector itself**.

Once you get a selector instance you can call [its public methods](https://github.com/reactjs/reselect/blob/v3.0.0/src/index.js#L81) like:

- `resultFunc`
- `recomputations`
- `resetRecomputations`


```js
import createCachedSelector from 're-reselect';

export const getMyData = createCachedSelector(
  selectorA,
  selectorB,
  (A, B) => doSomethingWith(A, B),
)(
  (state, arg1) => arg1,   // Use arg2 as cache key
);

// ...
// Call the selector to retrieve data
const myFooData = getMyData(state, 'foo');
const myBarData = getMyData(state, 'bar');

// Call getMatchingSelector to retrieve the selectors
// which generated "myFooData" and "myBarData" results
const myFooDataSelector = getMyData.getMatchingSelector(state, 'foo');
const myBarDataSelector = getMyData.getMatchingSelector(state, 'bar');

// Call reselect's selectors methods
myFooDataSelector.recomputations();
myFooDataSelector.resetRecomputations();
```

## API
**Re-reselect** consists in just one method exported as default.

```js
import reReselect from 're-reselect';
```

### reReselect([reselect's createSelector arguments])(resolverFunction, selectorCreator = selectorCreator)

**Re-reselect** accepts your original [selector creator arguments](https://github.com/reactjs/reselect/tree/v2.5.4#createselectorinputselectors--inputselectors-resultfunc) and returns a new function which accepts **2 arguments**:

- `resolverFunction`
- `selectorCreator` *(optional)*

`resolverFunction` is a function which receives the same arguments of your selectors (and `inputSelectors`) and *must return a **string** or **number***. The result is used as cache key to store/retrieve selector instances.

Cache keys of type `number` are treated like strings, since they are assigned to a JS object as arguments.

The resolver idea is inspired by [Lodash's .memoize](https://lodash.com/docs/4.17.4#memoize) util.

`selectorCreator` is an optional function in case you want to use custom selectors. By default it uses Reselect's `createSelector`.

#### Returns
(Function): a `reReselectInstance` selector ready to be used **like a normal reselect selector**.

### reReselectInstance(selectorArguments)
Retrieve data for given arguments.

>The followings are advanced methods and you won't need them for basic usage!

### reReselectInstance`.getMatchingSelector(selectorArguments)`
Retrieve the selector responding to the given arguments.

### reReselectInstance`.removeMatchingSelector(selectorArguments)`
Remove the selector responding to the given arguments from the cache.

### reReselectInstance`.clearCache()`
Clear the whole `reReselectInstance` cache.

### reReselectInstance`.resultFunc`
Get `resultFunc` for easily [test composed selectors](https://github.com/reactjs/reselect#q-how-do-i-test-a-selector).

## Todo's
- Named exports?
- Flow type definitions?
- Improve TS tests readability

## Contributors
Thanks to you all ([emoji key](https://github.com/kentcdodds/all-contributors#emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
| [<img src="https://avatars3.githubusercontent.com/u/4573549?v=4" width="100px;"/><br /><sub>Andrea Carraro</sub>](http://www.andreacarraro.it)<br />[💻](https://github.com/toomuchdesign/re-reselect/commits?author=toomuchdesign "Code") [📖](https://github.com/toomuchdesign/re-reselect/commits?author=toomuchdesign "Documentation") [🚇](#infra-toomuchdesign "Infrastructure (Hosting, Build-Tools, etc)") [⚠️](https://github.com/toomuchdesign/re-reselect/commits?author=toomuchdesign "Tests") [👀](#review-toomuchdesign "Reviewed Pull Requests") | [<img src="https://avatars2.githubusercontent.com/u/830824?v=4" width="100px;"/><br /><sub>Stepan Burguchev</sub>](https://github.com/xsburg)<br />[💻](https://github.com/toomuchdesign/re-reselect/commits?author=xsburg "Code") [👀](#review-xsburg "Reviewed Pull Requests") [⚠️](https://github.com/toomuchdesign/re-reselect/commits?author=xsburg "Tests") | [<img src="https://avatars3.githubusercontent.com/u/693493?v=4" width="100px;"/><br /><sub>Mitch Robb</sub>](https://olslash.github.io/)<br />[💻](https://github.com/toomuchdesign/re-reselect/commits?author=olslash "Code") [⚠️](https://github.com/toomuchdesign/re-reselect/commits?author=olslash "Tests") | [<img src="https://avatars3.githubusercontent.com/u/1128559?v=4" width="100px;"/><br /><sub>Stephane Rufer</sub>](https://github.com/rufman)<br />[💻](https://github.com/toomuchdesign/re-reselect/commits?author=rufman "Code") [⚠️](https://github.com/toomuchdesign/re-reselect/commits?author=rufman "Tests") | [<img src="https://avatars0.githubusercontent.com/u/2788860?v=4" width="100px;"/><br /><sub>Tracy Mullen</sub>](https://github.com/spiffysparrow)<br />[💻](https://github.com/toomuchdesign/re-reselect/commits?author=spiffysparrow "Code") [⚠️](https://github.com/toomuchdesign/re-reselect/commits?author=spiffysparrow "Tests") | [<img src="https://avatars1.githubusercontent.com/u/4211838?v=4" width="100px;"/><br /><sub>Sushain Cherivirala</sub>](https://www.skc.name)<br />[💻](https://github.com/toomuchdesign/re-reselect/commits?author=sushain97 "Code") | [<img src="https://avatars0.githubusercontent.com/u/6316590?v=4" width="100px;"/><br /><sub>Steve Mao</sub>](https://twitter.com/MaoStevemao)<br />[📖](https://github.com/toomuchdesign/re-reselect/commits?author=stevemao "Documentation") |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| [<img src="https://avatars3.githubusercontent.com/u/1177323?v=4" width="100px;"/><br /><sub>Denis Sikuler</sub>](https://github.com/gamtiq)<br />[💬](#question-gamtiq "Answering Questions") | [<img src="https://avatars1.githubusercontent.com/u/1586931?v=4" width="100px;"/><br /><sub>Sigfried Gold</sub>](http://sigfried.org)<br />[💬](#question-Sigfried "Answering Questions") | [<img src="https://avatars1.githubusercontent.com/u/132278?v=4" width="100px;"/><br /><sub>Daniel Karp</sub>](https://twitter.com/karptonite)<br />[💬](#question-karptonite "Answering Questions") | [<img src="https://avatars3.githubusercontent.com/u/10407025?v=4" width="100px;"/><br /><sub>Maarten Schumacher</sub>](https://github.com/maartenschumacher)<br />[💬](#question-maartenschumacher "Answering Questions") | [<img src="https://avatars2.githubusercontent.com/u/1428826?v=4" width="100px;"/><br /><sub>Gaurav Lahoti</sub>](https://github.com/Dante-101)<br />[🐛](https://github.com/toomuchdesign/re-reselect/issues?q=author%3ADante-101 "Bug reports") | [<img src="https://avatars3.githubusercontent.com/u/13602053?v=4" width="100px;"/><br /><sub>Lon</sub>](http://lon.im)<br />[🐛](https://github.com/toomuchdesign/re-reselect/issues?q=author%3Acnlon "Bug reports") |
<!-- ALL-CONTRIBUTORS-LIST:END -->
