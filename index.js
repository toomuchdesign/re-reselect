import { createSelector } from 'reselect';

export default function createCachedSelector(...funcs) {
  let cache = {};
  let cacheOrdering = [];
  const cacheSize = typeof funcs[funcs.length - 1] === 'number' ? funcs.pop() : 0;

  return (resolver, createSelectorInstance = createSelector) => {
    const selector = function(...args) {
      // Application receives this function
      const cacheKey = resolver(...args);

      if (typeof cacheKey === 'string' || typeof cacheKey === 'number') {
        if (cache[cacheKey] === undefined) {
          cache[cacheKey] = createSelectorInstance(...funcs);

          cacheOrdering.push(cacheKey);
          if (cacheSize > 0 && cacheOrdering.length > cacheSize) {
            const earliest = cacheOrdering.shift();
            delete cache[earliest];
          }
        } else {
          // Move the latest cache key to the top.
          cacheOrdering = [...cacheOrdering.filter(key => key !== cacheKey), cacheKey];
        }

        return cache[cacheKey](...args);
      }
      return undefined;
    };

    // Further selector methods
    selector.getMatchingSelector = (...args) => {
      const cacheKey = resolver(...args);
      return cache[cacheKey];
    };

    selector.removeMatchingSelector = (...args) => {
      const cacheKey = resolver(...args);
      if (cache[cacheKey] !== undefined) {
        cache[cacheKey] = undefined;
      }
    };

    selector.clearCache = () => {
      cache = {};
      cacheOrdering = [];
    };

    selector.resultFunc = funcs[funcs.length -1];

    return selector;
  }
}
