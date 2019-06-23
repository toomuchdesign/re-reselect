import {createSelector} from 'reselect';
import FlatObjectCache from './cache/FlatObjectCache';

const defaultCacheCreator = FlatObjectCache;
const defaultCacheKeyValidator = () => true;

function createCachedSelector(...funcs) {
  return (polymorphicOptions, legacyOptions) => {
    // @NOTE Versions 0.x/1.x accepted "options" as a function
    if (typeof legacyOptions === 'function') {
      throw new Error(
        '[re-reselect] Second argument "options" must be an object. Please use "options.selectorCreator" to provide a custom selectorCreator.'
      );
    }

    const options = {};
    if (typeof polymorphicOptions === 'function') {
      Object.assign(options, legacyOptions, {keySelector: polymorphicOptions});
      // @TODO add legacyOptions deprecation notice in next major release
    } else {
      Object.assign(options, polymorphicOptions);
    }

    // https://github.com/reduxjs/reselect/blob/v4.0.0/src/index.js#L54
    let recomputations = 0;
    const resultFunc = funcs.pop();
    const dependencies = Array.isArray(funcs[0]) ? funcs[0] : [...funcs];

    const resultFuncWithRecomputations = (...args) => {
      recomputations++;
      return resultFunc(...args);
    };
    funcs.push(resultFuncWithRecomputations);

    const cache = options.cacheObject || new defaultCacheCreator();
    const selectorCreator = options.selectorCreator || createSelector;
    const isValidCacheKey = cache.isValidCacheKey || defaultCacheKeyValidator;

    if (options.keySelectorCreator) {
      options.keySelector = options.keySelectorCreator({
        keySelector: options.keySelector,
        inputSelectors: dependencies,
        resultFunc,
      });
    }

    // Application receives this function
    const selector = function(...args) {
      const cacheKey = options.keySelector(...args);

      if (isValidCacheKey(cacheKey)) {
        let cacheResponse = cache.get(cacheKey);

        if (cacheResponse === undefined) {
          cacheResponse = selectorCreator(...funcs);
          cache.set(cacheKey, cacheResponse);
        }

        return cacheResponse(...args);
      }
      console.warn(
        `[re-reselect] Invalid cache key "${cacheKey}" has been returned by keySelector function.`
      );
      return undefined;
    };

    // Further selector methods
    selector.getMatchingSelector = (...args) => {
      const cacheKey = options.keySelector(...args);
      // @NOTE It might update cache hit count in LRU-like caches
      return cache.get(cacheKey);
    };

    selector.removeMatchingSelector = (...args) => {
      const cacheKey = options.keySelector(...args);
      cache.remove(cacheKey);
    };

    selector.clearCache = () => {
      cache.clear();
    };

    selector.resultFunc = resultFunc;

    selector.dependencies = dependencies;

    selector.cache = cache;

    selector.recomputations = () => recomputations;

    selector.resetRecomputations = () => (recomputations = 0);

    selector.keySelector = options.keySelector;

    return selector;
  };
}

export default createCachedSelector;
