import type { CreateSelectorOptions } from 'reselect';

import FlatObjectCache from './cache/FlatObjectCache';
import type { ICacheObject } from './cache/types';
import { createSelector } from './reselectWrapper';
import type { CreateCachedSelectorFunction } from './types';

const defaultCacheKeyValidator = () => true;

function parseReselectArgs(reselectArgs: readonly unknown[]): {
  inputSelectors: readonly unknown[];
  resultFunc: (...args: any[]) => unknown;
  createSelectorOptions: CreateSelectorOptions | undefined;
} {
  const args = [...reselectArgs];
  const lastArgument = args[args.length - 1];
  let resultFunc: (...args: any[]) => unknown;
  let createSelectorOptions: CreateSelectorOptions | undefined = undefined;

  if (typeof lastArgument === 'function') {
    resultFunc = args.pop() as (...args: any[]) => unknown;
  } else {
    createSelectorOptions = args.pop() as CreateSelectorOptions;
    resultFunc = args.pop() as (...args: any[]) => unknown;
  }

  return {
    inputSelectors: Array.isArray(args[0]) ? args[0] : [...args],
    resultFunc,
    createSelectorOptions,
  };
}

const createCachedSelector = ((...reselectArgs: unknown[]) => {
  const { inputSelectors, resultFunc, createSelectorOptions } =
    parseReselectArgs(reselectArgs);

  return (polymorphicOptions: any) => {
    const options: {
      keySelector?: (...args: any[]) => any;
      cacheObject?: ICacheObject;
      selectorCreator?: (...args: any[]) => any;
      keySelectorCreator?: (selectorInputs: {
        keySelector: ((...args: any[]) => any) | undefined;
        inputSelectors: readonly unknown[];
        resultFunc: (...args: any[]) => unknown;
      }) => (...args: any[]) => any;
    } =
      typeof polymorphicOptions === 'function'
        ? { keySelector: polymorphicOptions }
        : { ...polymorphicOptions };

    // https://github.com/reduxjs/reselect/blob/v4.0.0/src/index.js#L54
    let recomputations = 0;
    const resultFuncWithRecomputations = (...args: unknown[]) => {
      recomputations++;
      return resultFunc(...args);
    };

    const patchedReselectArgs: unknown[] = [
      inputSelectors,
      resultFuncWithRecomputations,
    ];
    if (createSelectorOptions) {
      patchedReselectArgs.push(createSelectorOptions);
    }

    const cache: ICacheObject = options.cacheObject || new FlatObjectCache();
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
    const selector: any = function (...args: unknown[]) {
      const cacheKey = options.keySelector!(...args);

      if (isValidCacheKey(cacheKey)) {
        let cacheResponse = cache.get(cacheKey) as
          | ((...a: unknown[]) => unknown)
          | undefined;

        if (cacheResponse === undefined) {
          cacheResponse = (selectorCreator as (...a: unknown[]) => unknown)(
            ...patchedReselectArgs,
          ) as (...a: unknown[]) => unknown;
          cache.set(cacheKey, cacheResponse);
        }

        return cacheResponse(...args);
      }
      console.warn(
        `[re-reselect] Invalid cache key "${String(
          cacheKey,
        )}" has been returned by keySelector function.`,
      );
      return undefined;
    };

    selector.getMatchingSelector = (...args: unknown[]) => {
      const cacheKey = options.keySelector!(...args);
      // @NOTE It might update cache hit count in LRU-like caches
      return cache.get(cacheKey);
    };

    selector.removeMatchingSelector = (...args: unknown[]) => {
      const cacheKey = options.keySelector!(...args);
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
}) as CreateCachedSelectorFunction;

// `withTypes` only refines the static types; at runtime it returns the same
// creator unchanged (mirrors reselect's implementation).
createCachedSelector.withTypes = () => createCachedSelector;

export default createCachedSelector;
