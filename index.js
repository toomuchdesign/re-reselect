import { createSelector } from 'reselect';

export default function createCachedSelector(...funcs) {
  let cache = {};

  return (resolver, createSelectorInstance = createSelector) => {
    const selector = function(...args) {
      // Application receives this function
      const cacheKey = resolver(...args);

      if (typeof cacheKey === 'string' || typeof cacheKey === 'number') {
        if (cache[cacheKey] === undefined) {
          cache[cacheKey] = createSelectorInstance(...funcs);
        }
        return cache[cacheKey](...args);
      }
      return undefined;
    };

    selector.getMatchingSelector = (...args) => {
      const cacheKey = resolver(...args);
      return cache[cacheKey];
    };

    selector.clearCache = () => {
      cache = {};
    }

    selector.removeCacheKey = (key) => {
      if (cache[key]) {
        cache[key] = undefined;
      }
    }

    return selector;
  }
}
