import FlatObjectCache from './cache/FlatObjectCache.ts';
import { createSelector } from './reselectWrapper.ts';

const defaultCacheCreator = FlatObjectCache;
const defaultCacheKeyValidator = () => true;

function parseReselectArgs(reselectArgs) {
  const args = [...reselectArgs];
  const lastArgument = args[args.length - 1];
  let resultFunc;
  let createSelectorOptions = undefined;

  // Last argument is resultFunc
  if (typeof lastArgument === 'function') {
    resultFunc = args.pop();
  } else {
    // Last argument is createSelectorOptions object
    createSelectorOptions = args.pop();
    resultFunc = args.pop();
  }

  return {
    inputSelectors: Array.isArray(args[0]) ? args[0] : [...args],
    resultFunc,
    createSelectorOptions,
  };
}

function createCachedSelector(...reselectArgs) {
  const { inputSelectors, resultFunc, createSelectorOptions } =
    parseReselectArgs(reselectArgs);

  return (polymorphicOptions) => {
    const options =
      typeof polymorphicOptions === 'function'
        ? { keySelector: polymorphicOptions }
        : Object.assign({}, polymorphicOptions);

    // https://github.com/reduxjs/reselect/blob/v4.0.0/src/index.js#L54
    let recomputations = 0;
    const resultFuncWithRecomputations = (...args) => {
      recomputations++;
      return resultFunc(...args);
    };

    // Patch reselect call arguments with a custom resultFunc
    const patchedReselectArgs = [inputSelectors, resultFuncWithRecomputations];
    if (createSelectorOptions) {
      patchedReselectArgs.push(createSelectorOptions);
    }

    const cache = options.cacheObject || new defaultCacheCreator();
    const selectorCreator = options.selectorCreator || createSelector;
    const isValidCacheKey = cache.isValidCacheKey || defaultCacheKeyValidator;

    if (options.keySelectorCreator) {
      options.keySelector = options.keySelectorCreator({
        keySelector: options.keySelector,
        inputSelectors,
        resultFunc,
      });
    }

    // User receives this function
    const selector = function (...args) {
      const cacheKey = options.keySelector(...args);

      if (isValidCacheKey(cacheKey)) {
        let cacheResponse = cache.get(cacheKey);

        if (cacheResponse === undefined) {
          cacheResponse = selectorCreator(...patchedReselectArgs);
          cache.set(cacheKey, cacheResponse);
        }

        return cacheResponse(...args);
      }
      console.warn(
        `[re-reselect] Invalid cache key "${cacheKey}" has been returned by keySelector function.`,
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

    selector.dependencies = inputSelectors;

    selector.cache = cache;

    selector.recomputations = () => recomputations;

    selector.resetRecomputations = () => (recomputations = 0);

    selector.keySelector = options.keySelector;

    return selector;
  };
}

export default createCachedSelector;
