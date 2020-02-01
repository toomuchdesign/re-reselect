## Join similar selectors

Let's pretend we are building an application displaying statistic **data about any country** of planet earth.

### With reselect only

```js
import { createSelector } from reselect;

const getWorldData = state => state.world;

/*
 * Solution 1: one selector for each country
 * Problem: 195 selectors to maintain
 */
const getAfghanistanData = createSelector(
  getWorldData,
  world => extractData(world, 'afghanistan'),
);
// Albania, Algeria, Amer...
const getZimbabweData = createSelector(
  getWorldData,
  world => extractData(world, 'zimbawe'),
);

/*
 * Solution 2: one selector shared by all countries
 * Problem: each call to a different country invalidates
 * the cache of the previous one
 */
const getCountryData = createSelector(
  getWorldData,
  (state, country) => country,
  (world, country) => extractData(world, country),
);

const afghanistan = getCountryData(state, 'afghanistan');
const zimbabwe = getCountryData(state, 'zimbawe');  // Cache invalidated
const afghanistanAgain = getCountryData(state, 'afghanistan');

// afghanistan !== afghanistanAgain

/*
 * Solution 3: use a factory function
 * Problem:
 * - Lost memoization across multiple components
 * - Must call the factory once for each country on each container component
 */
const makeGetCountryData = country => {
  return createSelector(
    getWorldData,
    world => extractData(world, country),
  );
}
```

### With re-reselect

```js
import createCachedSelector from re-reselect;

const getWorldData = state => state.world;

const getCountryData = createCachedSelector(
  getWorldData,
  (state, country) => country,
  (world, country) => extractData(world, country),
)(
  (state, country) => country, // Cache selectors by country name
);

const afghanistan = getCountryData(state, 'afghanistan');
const zimbabwe = getCountryData(state, 'zimbawe');
const afghanistanAgain = getCountryData(state, 'afghanistan');

// No selector factories and memoization is preserved among different components
// afghanistan === afghanistanAgain
```
