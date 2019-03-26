# Re-reselect

[![Build status][ci-badge]][ci]
[![Npm version][npm-version-badge]][npm]
[![Npm downloads][npm-downloads-badge]][npm]
[![Test coverage report][coveralls-badge]][coveralls]

`re-reselect` is a lightweight wrapper around **[Reselect][reselect]** meant to enhance selectors with **deeper memoization** and **cache management**.

**Switching between different arguments** using standard `reselect` selectors causes **cache invalidation** since default `reselect` cache has a **limit of one**.

`re-reselect` **forwards different calls to different** `reselect` **selectors** stored in cache, so that computed/memoized values are retained.

`re-reselect` **selectors work as normal** `reselect` **selectors** but they are able to determine when **creating a new selector or querying a cached one** on the fly, depending on the supplied arguments.

![Reselect and re-reselect][reselect-and-re-reselect-sketch]

Useful to:

- **retain selector's cache** when sequentially **called with one/few different arguments** ([example][example-1])
- **join similar selectors** into one
- **share selectors** with props across multiple component instances (see [reselect example][reselect-sharing-selectors] and [re-reselect solution][example-2])
- **instantiate** selectors **on runtime**

<!-- prettier-ignore -->
```js
import createCachedSelector from 're-reselect';

// Normal reselect routine: declare "inputSelectors" and "resultFunc"
const selectorA = state => state.a;
const selectorB = (state, itemName) => state.items[itemName];

const cachedSelector = createCachedSelector(
  // inputSelectors
  selectorA,
  selectorB,

  // resultFunc
  (A, B) => expensiveComputation(A, B)
)(
  // keySelector
  // Instruct re-reselect to use "itemName" as cacheKey
  (state, itemName) => itemName
);

// Use the cached selector like a normal selector:
const fooResult = cachedSelector(state, 'foo');
const barResult = cachedSelector(state, 'bar');

// 2 reselect selectors were created, called and cached behind the scenes

const fooResultAgain = cachedSelector(state, 'foo');

// fooResult === fooResultAgain
// Cache was not invalidated by calling "cachedSelector(state, 'bar')"
// "expensiveComputation" totally called twice
```

## Table of contents

- [Re-reselect](#re-reselect)
  - [Table of contents](#table-of-contents)
  - [Installation](#installation)
  - [Why? + example](#why--example)
    - [Re-reselect solution](#re-reselect-solution)
    - [Other viable solutions](#other-viable-solutions)
      - [1- Declare a different selector for each different call](#1--declare-a-different-selector-for-each-different-call)
      - [2- Declare a `makeGetPieceOfData` selector factory as explained in Reselect docs](#2--declare-a-makegetpieceofdata-selector-factory-as-explained-in-reselect-docs)
      - [3- Wrap your `makeGetPieceOfData` selector factory into a memoizer function and call the returning memoized selector](#3--wrap-your-makegetpieceofdata-selector-factory-into-a-memoizer-function-and-call-the-returning-memoized-selector)
  - [Examples](#examples)
  - [FAQ](#faq)
    - [How do I wrap my existing selector with re-reselect?](#how-do-i-wrap-my-existing-selector-with-re-reselect)
    - [How do I use multiple inputs to set the cacheKey?](#how-do-i-use-multiple-inputs-to-set-the-cachekey)
    - [How do I limit the cache size?](#how-do-i-limit-the-cache-size)
    - [How to share a selector across multiple components while passing in props and retaining memoization?](#how-to-share-a-selector-across-multiple-components-while-passing-in-props-and-retaining-memoization)
    - [How do I test a re-reselect selector?](#how-do-i-test-a-re-reselect-selector)
      - [Testing `reselect` selectors stored in the cache](#testing-reselect-selectors-stored-in-the-cache)
  - [API](#api)
    - [reReselect([reselect's createSelector arguments])(keySelector, { cacheObject, selectorCreator })](#rereselectreselects-createselector-argumentskeyselector--cacheobject-selectorcreator-)
      - [keySelector](#keyselector)
      - [options.cacheObject](#optionscacheobject)
        - [Custom cache strategy object](#custom-cache-strategy-object)
      - [options.selectorCreator](#optionsselectorcreator)
      - [Returns](#returns)
    - [reReselectInstance(selectorArguments)](#rereselectinstanceselectorarguments)
    - [reReselectInstance`.getMatchingSelector(selectorArguments)`](#rereselectinstancegetmatchingselectorselectorarguments)
    - [reReselectInstance`.removeMatchingSelector(selectorArguments)`](#rereselectinstanceremovematchingselectorselectorarguments)
    - [reReselectInstance`.cache`](#rereselectinstancecache)
    - [reReselectInstance`.clearCache()`](#rereselectinstanceclearcache)
    - [reReselectInstance`.dependencies`](#rereselectinstancedependencies)
    - [reReselectInstance`.resultFunc`](#rereselectinstanceresultfunc)
    - [reReselectInstance`.recomputations()`](#rereselectinstancerecomputations)
    - [reReselectInstance`.resetRecomputations()`](#rereselectinstanceresetrecomputations)
  - [About re-reselect](#about-re-reselect)
  - [Todo's](#todos)
  - [Contributors](#contributors)

## Installation

```console
npm install reselect
npm install re-reselect
```

## Why? + example

I found myself wrapping a library of data elaboration (quite heavy stuff) with reselect selectors (`getPieceOfData` in the example).

On each store update, I had to repeatedly call the selector in order to retrieve all the pieces of data needed by my UI. Like this:

```js
getPieceOfData(state, itemId, 'dataA');
getPieceOfData(state, itemId, 'dataB');
getPieceOfData(state, itemId, 'dataC');
```

What happens, here? `getPieceOfData` **selector cache is invalidated** on each call because of the different 3rd `'dataX'` argument.

### Re-reselect solution

`re-reselect` selectors keep a **cache of `reselect` selectors** and store/retrieve them by `cacheKey`.

<!-- Please note that part of this lines are repeated in #api chapter -->

`cacheKey` is by default a `string` or `number` but can be anything depending on the chosen cache strategy (see [`cacheObject` option](#optionscacheobject)).

`cacheKey` is the output of `keySelector`, declared at selector initialization.

`keySelector` is a **custom function** which:

- takes the same arguments as the final selector (in the example: `state`, `itemId`, `'dataX'`)
- returns a `cacheKey`.

Note that the **same `reselect` selector instance** stored in cache will be used for computing data for the **same `cacheKey`** (1:1).

Back to the example, `re-reselect` retrieves data by **querying one of the cached selectors** using the 3rd argument as `cacheKey`, allowing cache invalidation only when `state` or `itemId` change (but not `dataType`):

<!-- prettier-ignore -->
```js
const getPieceOfData = createCachedSelector(
  state => state,
  (state, itemId) => itemId,
  (state, itemId, dataType) => dataType,
  (state, itemId, dataType) => expensiveComputation(state, itemId, dataType)
)(
  (state, itemId, dataType) => dataType // Use dataType as cacheKey
);
```

`createCachedSelector` returns a selector with the **same signature as a normal `reselect` selector**.

But now, **each time the selector is called**, the following happens behind the scenes:

1.  **Evaluate the `cacheKey`** for current call by executing `keySelector`
2.  **Retrieve** from cache the **`reselect` selector** stored under the given `cacheKey`
3.  **Return found selector or create a new one** if no selector was found
4.  **Call returned selector** with provided arguments

**Re-reselect** stays completely optional and consumes **your installed reselect** module (`reselect` is declared as **peer dependency**).

### Other viable solutions

#### 1- Declare a different selector for each different call

Easy, but doesn't scale. See ["join similar selectors" example][example-1].

#### 2- Declare a `makeGetPieceOfData` selector factory as explained in Reselect docs

The solution suggested in [Reselect docs][reselect-sharing-selectors] is fine, but it has a few downsides:

- Bloats your code by exposing both `get` selectors and `makeGet` selector factories
- Needs to import/call selector factory instead of directly using selector
- Two different instances given the same arguments, will individually store and recompute the same result (read [this](https://github.com/reactjs/reselect/pull/213))

#### 3- Wrap your `makeGetPieceOfData` selector factory into a memoizer function and call the returning memoized selector

This is what `re-reselect` actually does! :-) It's quite verbose (since has to be repeated for each selector), **that's why re-reselect is here**.

## Examples

- [Join similar selectors][example-1]
- [Avoid selector factories][example-2]
- [Cache API calls][example-3]

## FAQ

### How do I wrap my existing selector with re-reselect?

Given your `reselect` selectors:

<!-- prettier-ignore -->
```js
import {createSelector} from 'reselect';

export const getMyData = createSelector(
  selectorA,
  selectorB,
  selectorC,
  (A, B, C) => doSomethingWith(A, B, C)
);
```

...add `keySelector` in the second function call:

<!-- prettier-ignore -->
```js
import createCachedSelector from 're-reselect';

export const getMyData = createCachedSelector(
  selectorA,
  selectorB,
  selectorC,
  (A, B, C) => doSomethingWith(A, B, C)
)(
  (state, arg1, arg2) => arg2 // Use arg2 as cacheKey
);
```

Voilà, `getMyData` is ready for use!

```js
const myData = getMyData(state, 'foo', 'bar');
```

### How do I use multiple inputs to set the cacheKey?

`cacheKey` is the return value of `keySelector`.

`keySelector` receives the same arguments of your `inputSelectors` and (by default) **must return a `string` or `number`.**

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

### How do I limit the cache size?

Use a `cacheObject` which provides that feature by supplying a [`cacheObject` option](#optionscacheobject).

You can also write **your own cache strategy**!

### How to share a selector across multiple components while passing in props and retaining memoization?

[This example][example-2] shows how `re-reselect` would solve the scenario described in [reselect docs][reselect-sharing-selectors].

### How do I test a re-reselect selector?

Just like a normal reselect selector!

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
import createCachedSelector from 're-reselect';

export const getMyData = createCachedSelector(
  selectorA,
  selectorB,
  (A, B) => doSomethingWith(A, B)
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

## API

`Re-reselect` exposes its **cached selector creator** as **default export**.

```js
import reReselect from 're-reselect';
// or:
import createCachedSelector from 're-reselect';
```

### reReselect([reselect's createSelector arguments])(keySelector, { cacheObject, selectorCreator })

**Re-reselect** accepts reselect's original [`createSelector` arguments][reselect-create-selector] and returns a new function which accepts **2 arguments**:

- `keySelector`
- `options { cacheObject, selectorCreator }` _(optional)_

#### keySelector

`keySelector` is a custom function receiving the same arguments as your selectors (and `inputSelectors`) and **returning a `cacheKey`**.

`cacheKey` is **by default a `string` or `number`** but can be anything depending on the chosen cache strategy (see [`cacheObject` option](#optionscacheobject)).

The `keySelector` idea comes from [Lodash's .memoize][lodash-memoize].

#### options.cacheObject

An optional custom [strategy object][docs-strategy-object] to handle the caching behaviour.

Default cache: `FlatObjectCache`.

`re-reselect` provides **6 ready to use cache object constructors**:

|                       name                        | accepted cacheKey |                 type                  |            storage             |
| :-----------------------------------------------: | :---------------: | :-----------------------------------: | :----------------------------: |
| [`FlatObjectCache`](src/cache/FlatObjectCache.js) | `number` `string` |            flat unlimited             |           JS object            |
| [`FifoObjectCache`](src/cache/FifoObjectCache.js) | `number` `string` | [first in first out][docs-fifo-cache] |           JS object            |
|  [`LruObjectCache`](src/cache/LruObjectCache.js)  | `number` `string` | [least recently used][docs-lru-cache] |           JS object            |
|    [`FlatMapCache`](src/cache/FlatMapCache.js)    |        any        |            flat unlimited             | [Map object][docs-mozilla-map] |
|    [`FifoMapCache`](src/cache/FifoMapCache.js)    |        any        | [first in first out][docs-fifo-cache] | [Map object][docs-mozilla-map] |
|     [`LruMapCache`](src/cache/LruMapCache.js)     |        any        | [least recently used][docs-lru-cache] | [Map object][docs-mozilla-map] |

<!-- prettier-ignore -->
```js
import createCachedSelector, {LruObjectCache, LruMapCache} from 're-reselect';

createCachedSelector(
  // ...
)(
  keySelector,
  {
    cacheObject: new LruObjectCache({cacheSize: 5}),
    // or:
    // cacheObject: new LruMapCache({cacheSize: 5}),
  }
);
```

**[*]ObjectCache** strategy objects treat `cacheKey` of type `number` like strings, since they are used as arguments of JS objects.

**[*]MapCache** strategy objects needs a **Map objects polyfill** in order to use them on non-supporting browsers.

##### Custom cache strategy object

You can provide **any kind of cache strategy**. Declare a JS object adhering to the following interface:

```ts
interface ICacheObject {
  set(key: any, selectorFn: any): void;
  get(key: any): any;
  remove(key: any): void;
  clear(): void;
  isValidCacheKey?(key: any): boolean; // optional
}
```

#### options.selectorCreator

An optional function describing a [custom selectors][reselect-create-selector-creator]. By default it uses `reselect`'s `createSelector`.

#### Returns

(Function): a `reReselectInstance` selector ready to be used **like a normal reselect selector**.

### reReselectInstance(selectorArguments)

Retrieve data for given arguments.

> The followings are advanced methods and you won't need them for basic usage!

### reReselectInstance`.getMatchingSelector(selectorArguments)`

Retrieve the selector responding to the given arguments.

### reReselectInstance`.removeMatchingSelector(selectorArguments)`

Remove from the cache the selector responding to the given arguments.

### reReselectInstance`.cache`

Get cacheObject instance being used by the selector (for advanced caching operations like [this](https://github.com/toomuchdesign/re-reselect/issues/40)).

### reReselectInstance`.clearCache()`

Clear whole `reReselectInstance` cache.

### reReselectInstance`.dependencies`

Get an array containing the provided `inputSelectors`. Refer to relevant discussion on [Reselect repo][reselect-test-selectors-dependencies].

### reReselectInstance`.resultFunc`

Get `resultFunc` for easily [testing composed selectors][reselect-test-selectors].

### reReselectInstance`.recomputations()`

Return the number of times the selector's result function has been recomputed.

### reReselectInstance`.resetRecomputations()`

Reset `recomputations` count.

## About re-reselect

- [Re-reselect your whole redux state](https://patrickdesjardins.com/blog/re-reselect-your-whole-redux-state)
- [Understanding reselect and re-reselect](http://alexnitta.com/understanding-reselect-and-re-reselect/)
- [Advanced Redux patterns: selectors](https://blog.brainsandbeards.com/advanced-redux-patterns-selectors-cb9f88381d74)
- [Be selective with your state](https://medium.com/riipen-engineering/be-selective-with-your-state-8f1be76cb9f4)
- [A swift developer’s React Native experience](https://swiftwithjustin.co/2018/06/24/a-swift-developers-react-native-experience)
- [5 key Redux libraries to improve code reuse](https://blog.logrocket.com/5-redux-libraries-to-improve-code-reuse-9f93eaceaa83)
- [Rematch's docs](https://github.com/rematch/rematch/blob/1.1.0/plugins/select/README.md#re-reselect)
- [Redux re-reselect playground](https://codesandbox.io/s/135rwqj2jj)

## Todo's

- Improve TS tests readability
- More examples

## Contributors

Thanks to you all ([emoji key][docs-all-contributors]):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore -->
| [<img src="https://avatars3.githubusercontent.com/u/4573549?v=4" width="100px;"/><br /><sub><b>Andrea Carraro</b></sub>](http://www.andreacarraro.it)<br />[💻](https://github.com/toomuchdesign/re-reselect/commits?author=toomuchdesign "Code") [📖](https://github.com/toomuchdesign/re-reselect/commits?author=toomuchdesign "Documentation") [🚇](#infra-toomuchdesign "Infrastructure (Hosting, Build-Tools, etc)") [⚠️](https://github.com/toomuchdesign/re-reselect/commits?author=toomuchdesign "Tests") [👀](#review-toomuchdesign "Reviewed Pull Requests") | [<img src="https://avatars2.githubusercontent.com/u/830824?v=4" width="100px;"/><br /><sub><b>Stepan Burguchev</b></sub>](https://github.com/xsburg)<br />[💻](https://github.com/toomuchdesign/re-reselect/commits?author=xsburg "Code") [👀](#review-xsburg "Reviewed Pull Requests") [⚠️](https://github.com/toomuchdesign/re-reselect/commits?author=xsburg "Tests") | [<img src="https://avatars3.githubusercontent.com/u/693493?v=4" width="100px;"/><br /><sub><b>Mitch Robb</b></sub>](https://olslash.github.io/)<br />[💻](https://github.com/toomuchdesign/re-reselect/commits?author=olslash "Code") [⚠️](https://github.com/toomuchdesign/re-reselect/commits?author=olslash "Tests") | [<img src="https://avatars3.githubusercontent.com/u/1128559?v=4" width="100px;"/><br /><sub><b>Stephane Rufer</b></sub>](https://github.com/rufman)<br />[💻](https://github.com/toomuchdesign/re-reselect/commits?author=rufman "Code") [⚠️](https://github.com/toomuchdesign/re-reselect/commits?author=rufman "Tests") | [<img src="https://avatars0.githubusercontent.com/u/2788860?v=4" width="100px;"/><br /><sub><b>Tracy Mullen</b></sub>](https://github.com/spiffysparrow)<br />[💻](https://github.com/toomuchdesign/re-reselect/commits?author=spiffysparrow "Code") [⚠️](https://github.com/toomuchdesign/re-reselect/commits?author=spiffysparrow "Tests") | [<img src="https://avatars1.githubusercontent.com/u/4211838?v=4" width="100px;"/><br /><sub><b>Sushain Cherivirala</b></sub>](https://www.skc.name)<br />[💻](https://github.com/toomuchdesign/re-reselect/commits?author=sushain97 "Code") | [<img src="https://avatars0.githubusercontent.com/u/6316590?v=4" width="100px;"/><br /><sub><b>Steve Mao</b></sub>](https://twitter.com/MaoStevemao)<br />[📖](https://github.com/toomuchdesign/re-reselect/commits?author=stevemao "Documentation") |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| [<img src="https://avatars2.githubusercontent.com/u/1428826?v=4" width="100px;"/><br /><sub><b>Gaurav Lahoti</b></sub>](https://github.com/Dante-101)<br />[🐛](https://github.com/toomuchdesign/re-reselect/issues?q=author%3ADante-101 "Bug reports") | [<img src="https://avatars3.githubusercontent.com/u/13602053?v=4" width="100px;"/><br /><sub><b>Lon</b></sub>](http://lon.im)<br />[🐛](https://github.com/toomuchdesign/re-reselect/issues?q=author%3Acnlon "Bug reports") | [<img src="https://avatars2.githubusercontent.com/u/5492495?v=4" width="100px;"/><br /><sub><b>bratushka</b></sub>](https://github.com/bratushka)<br />[💻](https://github.com/toomuchdesign/re-reselect/commits?author=bratushka "Code") | [<img src="https://avatars3.githubusercontent.com/u/615381?v=4" width="100px;"/><br /><sub><b>Anders D. Johnson</b></sub>](https://andrz.me)<br />[📖](https://github.com/toomuchdesign/re-reselect/commits?author=AndersDJohnson "Documentation") | [<img src="https://avatars3.githubusercontent.com/u/8556724?v=4" width="100px;"/><br /><sub><b>Július Retzer</b></sub>](https://github.com/wormyy)<br />[📖](https://github.com/toomuchdesign/re-reselect/commits?author=wormyy "Documentation") | [<img src="https://avatars3.githubusercontent.com/u/10407025?v=4" width="100px;"/><br /><sub><b>Maarten Schumacher</b></sub>](https://github.com/maartenschumacher)<br />[🤔](#ideas-maartenschumacher "Ideas, Planning, & Feedback") | [<img src="https://avatars2.githubusercontent.com/u/664238?v=4" width="100px;"/><br /><sub><b>Alexander Jarvis</b></sub>](https://github.com/alexanderjarvis)<br />[🤔](#ideas-alexanderjarvis "Ideas, Planning, & Feedback") |
| [<img src="https://avatars1.githubusercontent.com/u/514026?v=4" width="100px;"/><br /><sub><b>Gregg B</b></sub>](https://github.com/greggb)<br />[💡](#example-greggb "Examples") | [<img src="https://avatars0.githubusercontent.com/u/897931?v=4" width="100px;"/><br /><sub><b>Ian Obermiller</b></sub>](http://ianobermiller.com)<br />[👀](#review-ianobermiller "Reviewed Pull Requests") | [<img src="https://avatars3.githubusercontent.com/u/7040242?v=4" width="100px;"/><br /><sub><b>Kanitkorn Sujautra</b></sub>](https://github.com/lukyth)<br />[📖](https://github.com/toomuchdesign/re-reselect/commits?author=lukyth "Documentation") | [<img src="https://avatars2.githubusercontent.com/u/6233440?v=4" width="100px;"/><br /><sub><b>Brian Kraus</b></sub>](https://github.com/suark)<br />[📖](https://github.com/toomuchdesign/re-reselect/commits?author=suark "Documentation") | [<img src="https://avatars2.githubusercontent.com/u/9800850?v=4" width="100px;"/><br /><sub><b>Mateusz Burzyński</b></sub>](https://github.com/Andarist)<br />[💻](https://github.com/toomuchdesign/re-reselect/commits?author=Andarist "Code") [🚇](#infra-Andarist "Infrastructure (Hosting, Build-Tools, etc)") | [<img src="https://avatars1.githubusercontent.com/u/7252227?v=4" width="100px;"/><br /><sub><b>el-dav</b></sub>](https://github.com/el-dav)<br />[🐛](https://github.com/toomuchdesign/re-reselect/issues?q=author%3Ael-dav "Bug reports") | [<img src="https://avatars3.githubusercontent.com/u/15995890?v=4" width="100px;"/><br /><sub><b>Sergei Grishchenko</b></sub>](https://github.com/sgrishchenko)<br />[💻](https://github.com/toomuchdesign/re-reselect/commits?author=sgrishchenko "Code") [⚠️](https://github.com/toomuchdesign/re-reselect/commits?author=sgrishchenko "Tests") |
| [<img src="https://avatars3.githubusercontent.com/u/1970156?v=4" width="100px;"/><br /><sub><b>Augustin Riedinger</b></sub>](https://augustin-riedinger.fr)<br />[🤔](#ideas-augnustin "Ideas, Planning, & Feedback") |

<!-- ALL-CONTRIBUTORS-LIST:END -->

[reselect]: https://github.com/reactjs/reselect
[reselect-sharing-selectors]: https://github.com/reduxjs/reselect/tree/v4.0.0#sharing-selectors-with-props-across-multiple-component-instances
[reselect-test-selectors]: https://github.com/reactjs/reselect/tree/v4.0.0#q-how-do-i-test-a-selector
[reselect-test-selectors-dependencies]: https://github.com/reduxjs/reselect/issues/76#issuecomment-299194186
[reselect-selectors-methods]: https://github.com/reduxjs/reselect/blob/v4.0.0/src/index.js#L81
[reselect-create-selector]: https://github.com/reactjs/reselect/tree/v4.0.0#createselectorinputselectors--inputselectors-resultfunc
[reselect-create-selector-creator]: https://github.com/reactjs/reselect/tree/v4.0.0#createselectorcreatormemoize-memoizeoptions
[lodash-memoize]: https://lodash.com/docs/4.17.4#memoize
[ci-badge]: https://travis-ci.org/toomuchdesign/re-reselect.svg?branch=master
[ci]: https://travis-ci.org/toomuchdesign/re-reselect
[coveralls-badge]: https://coveralls.io/repos/github/toomuchdesign/re-reselect/badge.svg?branch=master
[coveralls]: https://coveralls.io/github/toomuchdesign/re-reselect?branch=master
[npm]: https://www.npmjs.com/package/re-reselect
[npm-version-badge]: https://img.shields.io/npm/v/re-reselect.svg
[npm-downloads-badge]: https://img.shields.io/npm/dm/re-reselect.svg
[reselect-and-re-reselect-sketch]: examples/reselect-and-re-reselect.png?raw=true
[example-1]: examples/1-join-selectors.md
[example-2]: examples/2-avoid-selector-factories.md
[example-3]: examples/3-cache-api-calls.md
[docs-fifo-cache]: https://en.wikipedia.org/wiki/Cache_replacement_policies#First_In_First_Out_.28FIFO.29
[docs-lru-cache]: https://en.wikipedia.org/wiki/Cache_replacement_policies#Least_Recently_Used_.28LRU.29
[docs-mozilla-map]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
[docs-strategy-object]: https://sourcemaking.com/design_patterns/strategy
[docs-all-contributors]: https://github.com/kentcdodds/all-contributors#emoji-key
