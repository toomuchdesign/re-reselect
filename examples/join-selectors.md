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
  world => extractData(world, 'afghanistan');
);
/// ...
const getZimbabweData = createSelector(
  getWorldData,
  world => extractData(world, 'zimbawe');
);

/*
 * Solution 2: one selector shared by all countries
 * Problem: calling a second different country invalidates the cache of the first one
 */
const getCountryData = createSelector(
  getWorldData,
  (state, country) => country,
  (world, country) => extractData(world, country);
);

const afghanistan = getCountryData(state, 'afghanistan');
const zimbabwe = getCountryData(state, 'zimbawe');  // Cache invaidated
const afghanistanAgain = getCountryData(state, 'afghanistan');

// afghanistan !== afghanistanAgain

/*
 * Solution 3: use a factory function
 * Problem:
 * - Memoization lost across multiple components
 * - Components need to call the factory and handle the 195 selectors
 */
const makeGetCountryData = country => {
  return createSelector(
    getWorldData,
    world => extractData(world, country);
  );
}

```

### With re-reselect
```js
import createCachedSelector from re-reselect;

const getWorldData = state => state.world;

const getCountryData = createSelector(
  getWorldData,
  (state, country) => country,
  (world, country) => extractData(world, country);
)(
  (state, country) => country, // Cache selectors by state name
);

const afghanistan = getCountryData(state, 'afghanistan');
const zimbabwe = getCountryData(state, 'zimbawe');
const afghanistanAgain = getCountryData(state, 'afghanistan');

// afghanistan === afghanistanAgain

```
