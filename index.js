import { createSelector } from 'reselect';

export default function createCachedSelector(...funcs) {
  const cache = {};

  return (resolver, createSelectorInstance = createSelector) => {
    const selector = function(...args) {
      // Application receives this function
      const cacheKey = resolver(...args);

      if (typeof cacheKey === 'string' || typeof cacheKey === 'number') {
        if (cache.hasOwnProperty(cacheKey) === false) {
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

    return selector;
  }
}
