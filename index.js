import { createSelector } from 'reselect';

export default function createCachedSelector(resolver, createSelectorInstance = createSelector) {
  const cache = {};

  return (...funcs) => (...args) => {
    // Application receives this function
    const cacheKey = resolver(...args);

    if (typeof cacheKey === 'string') {
      if (cache.hasOwnProperty(cacheKey) === false) {
        cache[cacheKey] = createSelectorInstance(...funcs);
      }
      return cache[cacheKey](...args);
    }
    return undefined;
  };
}
