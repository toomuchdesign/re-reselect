import { createSelector } from 'reselect';

export default function createCachedSelector(...funcs) {
  const cache = {};

  return (resolver, createSelectorInstance = createSelector) => (...args) => {
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
