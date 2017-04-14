# Re-reselect [![Build Status][ci-img]][ci]

Improve **[Reselect][reselect] performance** on few edge cases, by initializing selectors on the fly, using a **memoized factory**.

The resulting selector acts like a normal one, but It's able to determine when **querying a new selector instance or a cached one** on the fly, depending on the supplied arguments.

Useful to **reduce selectors recalculation** when:
- the same selector is repeatedly **called with one/few different arguments**
- the same selector is **imported by different modules** at the same time

[reselect]:                     https://github.com/reactjs/reselect
[ci-img]:                       https://travis-ci.org/toomuchdesign/re-reselect.svg
[ci]:                           https://travis-ci.org/toomuchdesign/re-reselect

```js
import createCachedSelector from 're-reselect';

const selectorA = state => state.a;
const selectorB = state => state.b;

const cachedSelector = createCachedSelector(
    // Set up your Reselect selector as normal

    // reselect inputSelectors:
    selectorA,
    selectorB,
    (state, someArg) => someArg,

    // reselect resultFunc:
    (A, B, someArg) => expensiveComputation(A, B, someArg}),
)(
    // Resolver function used as map cache key
    // (It takes the same selector arguments and must return a string)
    // In this case it will use the second arguments as cache key
    (state, someArg) => someArg,
);

// 2 different selector are created and cached
const fooSelector = cachedSelector(state, 'foo');
const barSelector = cachedSelector(state, 'bar');

// "foo" hits the cache: "foo" selector is retrieved and called again
const fooAgain = cachedSelector(state, 'foo');
```

Jump straight to the [API's](#api).

## Installation
```console
npm install re-reselect
```

## Why? + example
I found my self wrapping a library of data elaboration (quite heavy stuff) with reselect selectors (`getPieceOfData` in the example).

On each store update, I had to call the selector again again in order to retrieve all the pieces of data needed by my UI. Like this:

```js
getPieceOfData(state, itemId, 'dataA', otherArg);
getPieceOfData(state, itemId, 'dataB', otherArg);
getPieceOfData(state, itemId, 'dataC', otherArg);
```
What happens, here? `getPieceOfData` **selector cache is invalidated** on each call because of the changing 3rd `dataX` argument.

### Re-reselect solution
`createCachedSelector` keeps a private collection of selectors and store them by `key`.

`key` is the string output of the `resolver` function declared in selector initialization phase.

`resolver` is a custom function which receives the same arguments of final selector (in the example: `state`, `itemId`, `'dataX'`, `otherArgs`) and returns a `string` or `number`.

That said, I was able to configure `re-reselect` to create a map of selector using the 3rd argument as key:

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

But now, each time a selector is called, the following happens:
- Run `resolver` function and get its result (the cache key)
- Look for a matching key from the cache
- Return a cached selector or create a new one if no matching key is found in cache
- Call selector with with provided arguments

**Re-reselect** stays completely optional and uses **your installed reselect** library under the hoods (reselect is declared as a **peer depenency**).

Furthermore you can use any custom selector (see [API](#api)).

### Other viable solutions

#### 1- Declare a different selector for each different call
Easy but doesn't scale.

#### 2- Declare a `makeGetPieceOfData` selector factory as explained in [Reselect docs](https://github.com/reactjs/reselect/tree/v2.5.4#sharing-selectors-with-props-across-multiple-components)

Fine, but has 2 downsides:
- Bloat your selectors module by exposing both `get` selectors and `makeGet` selector factories
- Two different selector instances given the same arguments will individually recompute and store the same result (read [this](https://github.com/reactjs/reselect/pull/213))

#### 3- Wrap your `makeGetPieceOfData` selector factory into a memoizer function and call the returning memoized selector

This is what **re-reselect** actually does. It's quite verbose (since should be repeated for each selector), that's why I decided to move it into a separate module.

## FAQ
### Q: How do I wrap my existing selector with re-reselect?

A: Given your `reselect` selectors:

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
Voilà!

### Q: How do I test a re-reselect selector?
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
(Function): a `reReselectInstance` ready to be called to retrieve data from your store.

### reReselectInstance(selectorArguments)
Retrieve data for given arguments.

### reReselectInstance`.getMatchingSelector(selectorArguments)`
Retrieve the selector responding to the given arguments.

### reReselectInstance`.removeMatchingSelector(selectorArguments)`
Remove the selector responding to the given arguments from the cache.

### reReselectInstance`.clearCache()`
Clear the whole `reReselectInstance` cache.

## Todo's
- Named exports?
