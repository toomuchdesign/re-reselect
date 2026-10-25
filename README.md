# Re-reselect

[![Build status][ci-badge]][ci]
[![Npm version][npm-version-badge]][npm]
[![Npm downloads][npm-downloads-badge]][npm]
[![Test coverage report][coveralls-badge]][coveralls]

From [v5](https://github.com/reduxjs/reselect/releases/tag/v5.0.1), `reselect` provides the ability to natively implement custom memoization/caching solutions via `createSelector` options. Most of the features `re-reselect` used to enable should be now natively available in `reselect`. `re-reselect` will try to support `reselect` v5+ for backward compatibility reasons.

`re-reselect` is a lightweight wrapper around **[Reselect][reselect]** meant to enhance selectors with **deeper memoization** and **cache management**.

**Switching between different arguments** using standard `reselect` selectors causes **cache invalidation** since default `reselect` cache has a **limit of one**.

`re-reselect` **forwards different calls to different** `reselect` **selectors** stored in cache, so that computed/memoized values are retained.

`re-reselect` **selectors work as normal** `reselect` **selectors** but they are able to determine when **creating a new selector or querying a cached one** on the fly, depending on the supplied arguments.

![Reselect and re-reselect][reselect-and-re-reselect-sketch]

Useful to:

- **Retain selector's cache** when sequentially **called with one/few different arguments** ([example][example-1])
- **Join similar selectors** into one
- **Share selectors** with props across multiple component instances (see [reselect example][reselect-sharing-selectors] and [re-reselect solution][example-2])
- **Instantiate** selectors **on runtime**
- Enhance `reselect` with [custom caching strategies][cache-objects-docs]

<!-- prettier-ignore -->
```js
import {createCachedSelector} from 're-reselect';

// Normal reselect routine: declare "inputSelectors" and "resultFunc"
const getUsers = state => state.users;
const getLibraryId = (state, libraryName) => state.libraries[libraryName].id;

const getUsersByLibrary = createCachedSelector(
  // inputSelectors
  getUsers,
  getLibraryId,

  // resultFunc
  (users, libraryId) => expensiveComputation(users, libraryId),
)(
  // re-reselect keySelector (receives selectors' arguments)
  // Use "libraryName" as cacheKey
  (_state_, libraryName) => libraryName
);

// Cached selectors behave like normal selectors:
// 2 reselect selectors are created, called and cached
const reactUsers = getUsersByLibrary(state, 'react');
const vueUsers = getUsersByLibrary(state, 'vue');

// This 3rd call hits the cache
const reactUsersAgain = getUsersByLibrary(state, 'react');
// reactUsers === reactUsersAgain
// "expensiveComputation" called twice in total
```

## Table of contents

- [Installation](#installation)
- [Why? + example](#why--example)
  - [re-reselect solution](#re-reselect-solution)
  - [Other viable solutions](#other-viable-solutions)
- [Examples](#examples)
- [FAQ](#faq)
- [API](#api)
  - [Functions](#functions)
  - [Arguments](#arguments)
  - [Returned selector][selector-instance-docs]
- [Migrating from v5](#migrating-from-v5)
- [About re-reselect](#about-re-reselect)

## Installation

```console
npm install reselect
npm install re-reselect
```

## Why? + example

Let's say `getData` is a `reselect` selector.

```js
getData(state, itemId, 'dataA');
getData(state, itemId, 'dataB');
getData(state, itemId, 'dataA');
```

The **3rd argument invalidates `reselect` cache** on each call, forcing `getData` to re-evaluate and return a new value.

### re-reselect solution

`re-reselect` selectors keep a **cache of `reselect` selectors** stored by `cacheKey`.

<!-- Please note that part of this lines are repeated in #api chapter -->

`cacheKey` is the return value of the `keySelector` function. It's by default a `string` or `number` but it can be anything depending on the chosen cache strategy (see [cache objects docs][cache-objects-docs]).

`keySelector` is a custom function which:

- takes the same arguments as the selector itself (in the example: `state`, `itemId`, `dataType`)
- returns a `cacheKey`

A **unique persisting `reselect` selector instance** stored in cache is used to compute data for a given `cacheKey` (1:1).

Back to the example, we might setup `re-reselect` to retrieve data by **querying one of the cached selectors** using the 3rd argument as `cacheKey`, allowing cache invalidation only when `state` or `itemId` change (but not `dataType`):

<!-- prettier-ignore -->
```js
const getData = createCachedSelector(
  state => state,
  (state, itemId) => itemId,
  (state, itemId, dataType) => dataType,
  (state, itemId, dataType) => expensiveComputation(state, itemId, dataType)
)(
  (state, itemId, dataType) => dataType // Use dataType as cacheKey
);
```

**Replacing a selector with a cached selector is invisible to the consuming application since the API is the same.**

**When a cached selector is called**, the following happens behind the scenes:

1.  **Evaluate the `cacheKey`** for the current call by executing `keySelector`
2.  **Retrieve** from cache the **`reselect` selector** stored under the given `cacheKey`
3.  **Return found selector or create a new one** if no selector was found
4.  **Call returned selector** with provided arguments

### Other viable solutions

#### 1- Declare a different selector for each different call

Easy, but doesn't scale. See ["join similar selectors" example][example-1].

#### 2- Declare a `makeGetPieceOfData` selector factory as explained in Reselect docs

The solution suggested in [Reselect docs][reselect-sharing-selectors] is fine, but it has a few downsides:

- Bloats your code by exposing both `get` selectors and `makeGet` selector factories
- Needs to import/call the selector factory instead of directly using the selector
- Two different instances, given the same arguments, will individually store and recompute the same result (read [this](https://github.com/reactjs/reselect/pull/213))

#### 3- Wrap your `makeGetPieceOfData` selector factory into a memoizer function and call the returning memoized selector

This is what `re-reselect` actually does. 😀

## Examples

- [Join similar selectors][example-1]
- [Avoid selector factories][example-2]
- [Cache API calls][example-3]
- [Programmatic keySelector composition][example-4]
- [Usage with Selectorator][example-5]

## FAQ

<details>
  <summary>
    <b>How do I wrap my existing selector with re-reselect?</b>
  </summary>
  <br/>

Given your `reselect` selectors:

  <!-- prettier-ignore -->

```js
import { createSelector } from 'reselect';

export const getMyData = createSelector(
  selectorA,
  selectorB,
  selectorC,
  (A, B, C) => doSomethingWith(A, B, C),
);
```

...add `keySelector` in the second function call:

  <!-- prettier-ignore -->

```js
import { createCachedSelector } from 're-reselect';

export const getMyData = createCachedSelector(
  selectorA,
  selectorB,
  selectorC,
  (A, B, C) => doSomethingWith(A, B, C),
)(
  (state, arg1, arg2) => arg2, // Use arg2 as cacheKey
);
```

Voilà, `getMyData` is ready for use!

```js
const myData = getMyData(state, 'foo', 'bar');
```

</details>

<details>
  <summary>
    <b>How do I use multiple inputs to set the cacheKey?</b>
  </summary>
  <br/>

A few good examples and [a bonus](https://github.com/toomuchdesign/re-reselect/issues/3):

<!-- prettier-ignore -->
```js
// Basic usage: use a single argument as cacheKey
createCachedSelector(
  // ...
)(
  (state, arg1, arg2, arg3) => arg3
)

// Use multiple arguments and chain them into a string
createCachedSelector(
  // ...
)(
  (state, arg1, arg2, arg3) => `${arg1}:${arg3}`
)

// Extract properties from an object
createCachedSelector(
  // ...
)(
  (state, props) => `${props.a}:${props.b}`
)
```

</details>

<details>
  <summary>
    <b>How do I limit the cache size?</b>
  </summary>
  <br/>

Use a [`cacheObject`][cache-objects-docs] which provides that feature by supplying a [`cacheObject` option](#options).

You can also write **your own cache strategy**!

</details>

<details>
  <summary>
    <b>How to share a selector across multiple components while passing in props and retaining memoization?</b>
  </summary>
  <br/>

[This example][example-2] shows how `re-reselect` would solve the scenario described in [reselect docs][reselect-sharing-selectors].

</details>

<details>
  <summary>
    <b>How do I test a re-reselect selector?</b>
  </summary>
  <br/>

Like a normal reselect selector!

`re-reselect` selectors expose the same `reselect` testing methods:

- `dependencies`
- `resultFunc`
- `recomputations`
- `resetRecomputations`

Read more about testing selectors on [`reselect` docs][reselect-test-selectors].

#### Testing `reselect` selectors stored in the cache

Each **re-reselect** selector exposes a `getMatchingSelector` method which returns the **underlying matching selector** instance for the given arguments, **instead of the result**.

`getMatchingSelector` expects the same arguments as a normal selector call **BUT returns the instance of the cached selector itself**.

Once you get a selector instance you can call [its public methods][reselect-selectors-methods].

<!-- prettier-ignore -->
```js
import {createCachedSelector} from 're-reselect';

export const getMyData = createCachedSelector(selectorA, selectorB, (A, B) =>
  doSomethingWith(A, B)
)(
  (state, arg1) => arg1 // cacheKey
);

// Call your selector
const myFooData = getMyData(state, 'foo');
const myBarData = getMyData(state, 'bar');

// Call getMatchingSelector method to retrieve underlying reselect selectors
// which generated "myFooData" and "myBarData" results
const myFooDataSelector = getMyData.getMatchingSelector(state, 'foo');
const myBarDataSelector = getMyData.getMatchingSelector(state, 'bar');

// Call reselect's selectors methods
myFooDataSelector.recomputations();
myFooDataSelector.resetRecomputations();
```

</details>

## API

### Functions

#### createCachedSelector

<!-- prettier-ignore -->
```js
import {createCachedSelector} from 're-reselect';

createCachedSelector(
  // ...reselect's `createSelector` arguments
)(
  keySelector | { options }
)
```

Takes the same arguments as reselect's [`createSelector`][reselect-create-selector] and returns a new function which accepts a [`keySelector`](#keyselector) or an [`options`](#options) object.

**Returns** a [selector instance][selector-instance-docs].

#### createCachedSelector.withTypes\<State\>()

Creates a **pre-typed** version of `createCachedSelector` with the `state` type baked in, mirroring reselect's [`createSelector.withTypes`][reselect-with-types]. Set the `state` type once instead of annotating it on every input selector:

```ts
const createAppCachedSelector = createCachedSelector.withTypes<RootState>();
```

Without `withTypes` you annotate `state` on every input selector:

```ts
const selectTodoById = createCachedSelector(
  (state: RootState) => state.todos,
  (state: RootState, id: string) => id,
  (todos, id) => todos[id],
)((state: RootState, id) => id);
```

With a pre-typed creator, `state` is inferred everywhere while per-selector params and the result stay inferred:

```ts
const selectTodoById = createAppCachedSelector(
  [
    (state) => state.todos, // `state` inferred as `RootState`
    (state, id: string) => id, // `id` param still inferred
  ],
  (todos, id) => todos[id],
)((state, id) => id); // `keySelector` `state` inferred too
```

> **Pass input selectors as an array.** As with reselect's `createSelector.withTypes`, state inference only works when input selectors are given as a single array argument. With the variadic form (input selectors spread as separate arguments), `state` and the combiner arguments are inferred as `any`.

Only the `state` type is pre-typed. `withTypes` is a **type-only** helper: at runtime it returns the same `createCachedSelector` unchanged. Calls can be chained to narrow the state further (the override type must extend the current one).

#### createStructuredCachedSelector

<!-- prettier-ignore -->
```js
import {createStructuredCachedSelector} from 're-reselect';

createStructuredCachedSelector(
  // ...reselect's `createStructuredSelector` arguments
)(
  keySelector | { options }
)
```

Takes the same arguments as reselect's [`createStructuredSelector`][reselect-create-structured-selector] and returns a new function which accepts a [`keySelector`](#keyselector) or an [`options`](#options) object.

**Returns** a [selector instance][selector-instance-docs].

---

### Arguments

#### keySelector

A custom function receiving the same arguments as your selectors (and `inputSelectors`) and **returning a `cacheKey`**.

`cacheKey` is **by default a `string` or `number`** but can be anything depending on the chosen cache strategy (see [`cacheObject` option](#options)).

The `keySelector` idea comes from [Lodash's .memoize resolver][lodash-memoize].

#### options

| Option                                             | Type       | Default                                                   | Description                                                                                                                                          |
| -------------------------------------------------- | ---------- | --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `keySelector`                                      | `function` | `undefined`                                               | The [`keySelector`](#keyselector) used by the cached selector.                                                                                       |
| `cacheObject`                                      | `object`   | [`FlatObjectCache`][cache-objects-docs]                   | An optional custom **cache strategy object** to handle the caching behaviour. Read more about [re-reselect's custom cache here][cache-objects-docs]. |
| [`keySelectorCreator`](#optionskeyselectorcreator) | `function` | `undefined`                                               | An optional function returning the [`keySelector`](#keyselector) used by the cached selector. Overrides any provided `keySelector`.                  |
| `selectorCreator`                                  | `function` | `reselect`'s [`createSelector`][reselect-create-selector] | An optional function describing a [custom version of createSelector][reselect-create-selector-creator].                                              |

#### options.keySelectorCreator

```typescript
type keySelectorCreator = (selectorInputs: {
  inputSelectors: InputSelector[];
  resultFunc: ResultFunc;
  // Absent unless a `keySelector` was also supplied
  keySelector?: KeySelector;
}) => KeySelector;
```

This allows the ability to dynamically **generate `keySelectors` on runtime** based on provided `inputSelectors`/`resultFunc` supporting [**key selectors composition**](https://github.com/toomuchdesign/re-reselect/pull/73). It overrides any provided `keySelector`.

See [programmatic keySelector composition][example-4] example.

---

### Returned selector

`createCachedSelector` and `createStructuredCachedSelector` return a **selector instance** which extends the API of a **standard reselect selector**.

> The following are advanced methods and you won't need them for basic usage!

#### Cache

| Member                                               | Description                                                                                                                                                    |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `selector.getMatchingSelector(selectorArguments)`    | Retrieve the selector responding to the given arguments, or `undefined` if none is cached.                                                                     |
| `selector.removeMatchingSelector(selectorArguments)` | Remove from the cache the selector responding to the given arguments.                                                                                          |
| `selector.cache`                                     | Get the cacheObject instance being used by the selector (for advanced caching operations like [this](https://github.com/toomuchdesign/re-reselect/issues/40)). |
| `selector.clearCache()`                              | Clear whole `selector` cache.                                                                                                                                  |
| `selector.keySelector`                               | Get `keySelector` for utility compositions or testing.                                                                                                         |

#### Inherited from reselect

| Member                           | Description                                                                                                                                   |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `selector.dependencies`          | Get an array containing the provided `inputSelectors`. Refer to relevant discussion on [Reselect repo][reselect-test-selectors-dependencies]. |
| `selector.resultFunc`            | Get `resultFunc` for easily [testing composed selectors][reselect-test-selectors].                                                            |
| `selector.recomputations()`      | Return the number of times the selector's result function has been recomputed.                                                                |
| `selector.resetRecomputations()` | Reset `recomputations` count.                                                                                                                 |

## Migrating from v5

v6 is a rewrite in TypeScript. JavaScript users only need the runtime changes. The [changelog][changelog] has the full migration table.

Runtime and packaging:

- `resetRecomputations()` returns `undefined`. Read the count with `recomputations()`.
- A missing `keySelector` throws when the selector is created, not on its first call.
- Any falsy value returned by a custom `cacheObject.get()` counts as a cache miss.
- The UMD bundle is gone: use an ESM CDN such as `https://esm.sh/re-reselect`, or bundle re-reselect. Deep imports like `re-reselect/dist/...` no longer resolve.
- In native Node ESM, `import reReselect from 're-reselect'` fails: use named imports or `import * as`.
- The bundles use ES2020 syntax (ES2019 for the `module` entry). Transpile `node_modules` if you target older engines.

TypeScript:

- Explicit type arguments like `createCachedSelector<S, R1, T>(…)` fail with `TS2558`. Drop them and annotate the input selectors, or pass `<[typeof selectA, typeof selectB], Result>`.
- Selector arguments are inferred from the input selectors. Extra or missing arguments are rejected, and so is a `keySelector` reading an argument no input selector declares. Add a parametric input selector such as `(state, id) => id` for that argument.
- An inline input selector without a `state` annotation infers `state` as `any`, as in reselect v5. Annotate it, or use `withTypes` with an array of input selectors.
- `getMatchingSelector` is typed as returning `OutputSelector | undefined`, as it already did at runtime on a cache miss. Check the result or use `?.`.
- `keySelectorCreator` receives `keySelector` as optional. Check it before calling it.
- `Selector` and `OutputSelector` are no longer exported: import them from `reselect`. `CreateSelectorInstance` is gone too: use reselect's `CreateSelectorFunction`. The `Parametric*` types are gone: write `ParametricSelector<S, P, R>` as `Selector<S, R, [P]>`.
- `OutputCachedSelector<InputSelectors, Result>` now types the cached selector, not the factory returned by `createCachedSelector(...)`. Annotate the selector instead.
- `KeySelectorCreator<InputSelectors, Result>` takes the input selectors instead of the state type.
- A `createStructuredCachedSelector` call with a very large selectors object (roughly 50+ keys) can fail with `TS2589`. Split it into smaller ones.

## About re-reselect

- [Redux docs: Deriving Data with Selectors](https://redux.js.org/usage/deriving-data-selectors#re-reselect)
- [re-reselect your whole redux state](https://patrickdesjardins.com/blog/re-reselect-your-whole-redux-state)
- [React re-reselect: Better memoization and cache management](https://blog.logrocket.com/react-re-reselect-better-memoization-cache-management/)
- [Advanced Redux patterns: selectors](https://brainsandbeards.com/blog/advanced-redux-patterns-selectors/)
- [Be selective with your state](https://medium.com/riipen-engineering/be-selective-with-your-state-8f1be76cb9f4)
- [5 key Redux libraries to improve code reuse](https://blog.logrocket.com/5-redux-libraries-to-improve-code-reuse-9f93eaceaa83)
- [Rematch's docs](https://github.com/rematch/rematch/blob/1.1.0/plugins/select/README.md#re-reselect)
- [Redux re-reselect playground](https://codesandbox.io/s/135rwqj2jj)

[reselect]: https://github.com/reactjs/reselect
[reselect-sharing-selectors]: https://github.com/reduxjs/reselect/tree/v4.0.0#sharing-selectors-with-props-across-multiple-component-instances
[reselect-test-selectors]: https://github.com/reactjs/reselect/tree/v4.0.0#q-how-do-i-test-a-selector
[reselect-test-selectors-dependencies]: https://github.com/reduxjs/reselect/issues/76#issuecomment-299194186
[reselect-selectors-methods]: https://github.com/reduxjs/reselect/blob/v4.0.0/src/index.js#L81
[reselect-create-selector]: https://github.com/reactjs/reselect/tree/v4.0.0#createselectorinputselectors--inputselectors-resultfunc
[reselect-create-structured-selector]: https://github.com/reduxjs/reselect/tree/v4.0.0#createstructuredselectorinputselectors-selectorcreator--createselector
[reselect-create-selector-creator]: https://github.com/reactjs/reselect/tree/v4.0.0#createselectorcreatormemoize-memoizeoptions
[reselect-with-types]: https://reselect.js.org/api/createselector#createselectorwithtypes
[lodash-memoize]: https://lodash.com/docs/4.17.4#memoize
[ci-badge]: https://github.com/toomuchdesign/re-reselect/actions/workflows/ci.yml/badge.svg
[ci]: https://github.com/toomuchdesign/re-reselect/actions/workflows/ci.yml
[coveralls-badge]: https://coveralls.io/repos/github/toomuchdesign/re-reselect/badge.svg?branch=master
[coveralls]: https://coveralls.io/github/toomuchdesign/re-reselect?branch=master
[npm]: https://www.npmjs.com/package/re-reselect
[npm-version-badge]: https://img.shields.io/npm/v/re-reselect.svg
[npm-downloads-badge]: https://img.shields.io/npm/dm/re-reselect.svg
[reselect-and-re-reselect-sketch]: examples/reselect-and-re-reselect.png?raw=true
[example-1]: examples/1-join-selectors.md
[example-2]: examples/2-avoid-selector-factories.md
[example-3]: examples/3-cache-api-calls.md
[example-4]: examples/4-programmatic-keyselector-composition.md
[example-5]: examples/5-selectorator.md
[selector-instance-docs]: #returned-selector
[cache-objects-docs]: src/cache#readme
[changelog]: CHANGELOG.md
