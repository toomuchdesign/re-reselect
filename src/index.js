import {createSelector} from 'reselect';
import FlatCacheObject from './cache/FlatCacheObject';

export default function createCachedSelector(...funcs) {
  const defaultCacheCreator = FlatCacheObject;

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

    const selector = function(...args) {
      // Application receives this function
      const cacheKey = resolver(...args);

      // Avoid implicit cache entries conversions like "[object Object]" or "1,2,3"
      // when an object or an array is passed as cacheKey
      // @NOTE this check is preventing cache from using Maps
      if (typeof cacheKey === 'string' || typeof cacheKey === 'number') {
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
