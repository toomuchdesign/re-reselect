import { createSelector } from 'reselect';

// @TODO Move it into a separate file and test it
function flatCacheObjectCreator() {
  return {
    _cache: {},
    set(key, selectorFn) {
      this._cache[key] = selectorFn;
    },
    get(key) {
      return this._cache[key];
    },
    remove(key) {
      delete this._cache[key];
    },
    clear() {
      this._cache = {};
    },
  }
}

export default function createCachedSelector(...funcs) {
  const defaultCacheCreator = flatCacheObjectCreator;

  return (resolver, options = {}) => {
    let cache;
    let selectorCreator;

    // Allow "options" to be provided as a "selectorCreator" for backward compatibility
    // @TODO Remove "options" as a function in next breaking release
    if(typeof options === 'function') {
      cache = defaultCacheCreator();
      selectorCreator = options;
    } else {
      cache = options.cacheObject || defaultCacheCreator();
      selectorCreator = options.selectorCreator || createSelector;
    }

    const selector = function(...args) {
      // Application receives this function
      const cacheKey = resolver(...args);

      if (typeof cacheKey === 'string' || typeof cacheKey === 'number') {
        let cacheResult = cache.get(cacheKey);

        if (cacheResult === undefined) {
          cache.set(cacheKey, selectorCreator(...funcs));
          cacheResult = cache.get(cacheKey);
        }

        return cacheResult(...args);
      }
      return undefined;
    };

    // Further selector methods
    selector.getMatchingSelector = (...args) => {
      const cacheKey = resolver(...args);
      // @NOTE It might update cache hit count in LRU-like caches
      return cache.get(cacheKey);
    };

    selector.removeMatchingSelector = (...args) => {
      const cacheKey = resolver(...args);
      cache.remove(cacheKey);
    };

    selector.clearCache = () => {
      cache.clear();
    };

    selector.resultFunc = funcs[funcs.length -1];

    return selector;
  }
}
