# Re-reselect [![Build Status][ci-img]][ci]

Enhance **[Reselect](reselect) selectors** by wrapping `createSelector` function and returning a memoized **collection of selectors** indexed with the **cache key** returned by a custom **resolver function**.

Useful to **reduce selectors recalculation** when same selector is repeatedly **called with one/few different arguments**.

[reselect]:                     https://github.com/reactjs/reselect
[ci-img]:                       https://travis-ci.org/toomuchdesign/re-reselect.svg
[ci]:                           https://travis-ci.org/toomuchdesign/re-reselect

```js
import createCachedSelector from 'reselect';

const selectorA = state => state.a;
const selectorB = state => state.b;

const foodInfoSelector = createCachedSelector(
  // Resolver function used as map cache key (takes same selector arguments and must return a string)
  // In this case it will use the second arguments as cache key
  (state, someArg) => someArg,
)(
  // From here it's just normal Reselect stuff.

  // reselect inputSelectors:
  selectorA,
  selectorB,
  (state, someArg) => someArg,

  // reselect resultFunc:
  (A, B, someArg) => expensiveComputation(food, drink, infoType}),   
);

// 2 different selector are created and cached
const fooSelector = foodInfoSelector(state, 'foo');
const barSelector = foodInfoSelector(state, 'bar');

// "foo" hits the cache: "foo" selector is retrieved and called again
const fooAgain = foodInfoSelector(state, 'foo');
```

## Installation
```console
  npm install re-reselect
```

## API
### createCachedSelector(resolverFunction, selectorCreator = selectorCreator)(...inputSelectors | [inputSelectors])
