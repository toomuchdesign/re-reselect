import {createSelector} from 'reselect';
import FlatObjectCache from './cache/FlatObjectCache';

const defaultCacheCreator = FlatObjectCache;
const defaultCacheKeyValidator = () => true;

function createCachedSelector(...funcs) {
  return (keySelector = () => '', options = {}) => {
    // @NOTE Versions 0.x/1.x accepted "options" as a function
    if (typeof options === 'function') {
      throw new Error(
        '[re-reselect] Second argument "options" must be an object. Please use "options.selectorCreator" to provide a custom selectorCreator.'
      );
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

    // Application receives this function
    const selector = function(...args) {
      const cacheKey = keySelector(...args);

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
      const cacheKey = keySelector(...args);
      // @NOTE It might update cache hit count in LRU-like caches
      return cache.get(cacheKey);
    };

    selector.removeMatchingSelector = (...args) => {
      const cacheKey = keySelector(...args);
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

    selector.keySelector = keySelector;

    return selector;
  };
}

export default createCachedSelector;

const defaultKeySeparator = ':';

const hasKeySelector = selector => 'keySelector' in selector;

const composeKeySelectors = (
  mainKeySelector,
  otherKeySelectors,
  keySeparator
) =>
  function() {
    const mainKey = mainKeySelector.apply(null, arguments);
    let resultKey = mainKey;

    for (let i = 0, length = otherKeySelectors.length; i < length; i += 1) {
      const otherKey = otherKeySelectors[i].apply(null, arguments);
      if (
        (typeof otherKey === 'object' && otherKey !== null) ||
        typeof otherKey === 'function'
      ) {
        return mainKey;
      }
      resultKey += keySeparator + otherKey;
    }

    return resultKey;
  };

export function createKeyComposedSelector(...funcs) {
  return (mainKeySelector = () => '', options = {}) => {
    const resultFunc = funcs.pop();
    const dependencies = Array.isArray(funcs[0]) ? funcs[0] : [...funcs];

    const {keySeparator = defaultKeySeparator, ...restOptions} = options;

    const otherKeySelectors = Array.from(
      new Set(
        dependencies
          .filter(hasKeySelector)
          .map(selector => selector.keySelector)
      )
    );

    const keySelector = composeKeySelectors(
      mainKeySelector,
      otherKeySelectors,
      keySeparator
    );

    return createCachedSelector(...dependencies, resultFunc)(
      keySelector,
      restOptions
    );
  };
}

// Cache objects
export {FlatObjectCache};
export {default as FifoObjectCache} from './cache/FifoObjectCache';
export {default as LruObjectCache} from './cache/LruObjectCache';
export {default as FlatMapCache} from './cache/FlatMapCache';
export {default as FifoMapCache} from './cache/FifoMapCache';
export {default as LruMapCache} from './cache/LruMapCache';

// Deprecated cache objects exports
// @TODO remove in next major release
export {FlatObjectCache as FlatCacheObject};
export {default as FifoCacheObject} from './cache/FifoObjectCache';
export {default as LruCacheObject} from './cache/LruMapCache';
