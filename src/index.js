import {createSelector} from 'reselect';
import FlatCacheObject from './cache/FlatCacheObject';

const defaultCacheCreator = FlatCacheObject;
const defaultCacheKeyValidator = cacheKey => {
  // By default avoid implicit cache entries conversions like "[object Object]" or "1,2,3"
  return typeof cacheKey === 'string' || typeof cacheKey === 'number';
};

export default function createCachedSelector(...funcs) {
  return (resolver, options = {}) => {
    let cache;
    let selectorCreator;

    // Allow "options" to be provided as a "selectorCreator" for backward compatibility
    // @TODO Remove "options" as a function in next breaking release
    if (typeof options === 'function') {
      console.warn(
        '[re-reselect] Deprecation warning: "selectorCreator" argument is discouraged and will be removed in the upcoming major release. Please use "options.selectorCreator" instead.'
      );
      cache = new defaultCacheCreator();
      selectorCreator = options;
    } else {
      cache = options.cacheObject || new defaultCacheCreator();
      selectorCreator = options.selectorCreator || createSelector;
    }

    const isCacheKeyValid = cache.isCacheKeyValid || defaultCacheKeyValidator;

    // Application receives this function
    const selector = function(...args) {
      const cacheKey = resolver(...args);

      if (isCacheKeyValid(cacheKey)) {
        let cacheResponse = cache.get(cacheKey);

        if (cacheResponse === undefined) {
          cacheResponse = selectorCreator(...funcs);
          cache.set(cacheKey, cacheResponse);
        }

        return cacheResponse(...args);
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

    selector.resultFunc = funcs[funcs.length - 1];

    return selector;
  };
}

export {FlatCacheObject};
export {default as FifoCacheObject} from './cache/FifoCacheObject';
export {default as LruCacheObject} from './cache/LruCacheObject';
