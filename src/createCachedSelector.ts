import type { Combiner, CreateSelectorOptions, SelectorArray } from 'reselect';

import FlatObjectCache from './cache/FlatObjectCache';
import type { ICacheObject } from './cache/types';
import { createSelector } from './reselectWrapper';
import type {
  CreateCachedSelector,
  CreateCachedSelectorImpl,
  CreateCachedSelectorOptions,
  PolymorphicCachedOptions,
} from './types';

type UnknownFunction = (...args: readonly unknown[]) => unknown;

const defaultCacheKeyValidator = () => true;

function isFunction(value: unknown): value is UnknownFunction {
  return typeof value === 'function';
}

function parseReselectArgs(reselectArgs: readonly unknown[]): {
  inputSelectors: SelectorArray;
  resultFunc: Combiner<SelectorArray, unknown>;
  createSelectorOptions?: CreateSelectorOptions;
} {
  // Walk the args from the right. The last arg is either the combiner (no
  // trailing options) or `createSelectorOptions`; in the latter case, the
  // combiner sits one position before. Whatever remains is the input
  // selectors — either spread as individual functions or wrapped in a
  // single array.
  const args = [...reselectArgs];
  const last = args.pop();

  let resultFunc: unknown;
  let createSelectorOptions: unknown;
  if (isFunction(last)) {
    resultFunc = last;
    createSelectorOptions = undefined;
  } else {
    resultFunc = args.pop();
    createSelectorOptions = last;
  }

  const inputSelectors = Array.isArray(args[0]) ? args[0] : args;

  // Single point of variadic-to-typed narrowing: the public overloads
  // guarantee these shapes at compile time; the runtime impl reconstructs them
  // from the erased argv. Cast each field rather than suppressing the whole
  // return, so the property names stay checked against the declared type.
  return {
    inputSelectors: inputSelectors as SelectorArray,
    resultFunc: resultFunc as Combiner<SelectorArray, unknown>,
    createSelectorOptions: createSelectorOptions as
      CreateSelectorOptions | undefined,
  };
}

// The impl is a single variadic function; it cannot structurally satisfy
// `CreateCachedSelectorImpl`'s three precisely-typed overloads (reselect's own
// `createSelector` casts for the same reason). Public callers see the typed
// overloads; the body operates on erased args. Scoped to this one cast, so any
// *other* type error in the body still surfaces.
const createCachedSelectorImpl = ((
  ...reselectArgs: readonly unknown[]
): unknown => {
  const { inputSelectors, resultFunc, createSelectorOptions } =
    parseReselectArgs(reselectArgs);

  return (
    polymorphicOptions: PolymorphicCachedOptions<SelectorArray, unknown>,
  ) => {
    // Clone the caller's options object defensively: below we may write the
    // `keySelectorCreator` result back onto `options.keySelector`. Mutating the
    // caller's object would (a) leak a side effect and (b) double-wrap the
    // keySelector when the same options object is reused across factory calls.
    const options: CreateCachedSelectorOptions<SelectorArray, unknown> =
      isFunction(polymorphicOptions)
        ? { keySelector: polymorphicOptions }
        : { ...polymorphicOptions };

    let recomputations = 0;
    const resultFuncWithRecomputations: UnknownFunction = (...args) => {
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

    const cache: ICacheObject = options.cacheObject ?? new FlatObjectCache();
    const selectorCreator = options.selectorCreator ?? createSelector;
    const isValidCacheKey = cache.isValidCacheKey ?? defaultCacheKeyValidator;

    if (options.keySelectorCreator) {
      options.keySelector = options.keySelectorCreator({
        keySelector: options.keySelector,
        inputSelectors,
        resultFunc,
      });
    }

    function selector(...args: readonly unknown[]): unknown {
      // Destructure to satisfy keySelector's `(state, ...rest)` shape from
      // a fully-variadic `unknown[]` — direct spread would be rejected.
      const [state, ...rest] = args;
      const cacheKey = options.keySelector!(state, ...rest);

      if (!isValidCacheKey(cacheKey)) {
        console.warn(
          `[re-reselect] Invalid cache key "${String(
            cacheKey,
          )}" has been returned by keySelector function.`,
        );
        return undefined;
      }

      let cacheResponse: UnknownFunction | undefined = cache.get(cacheKey);

      if (!cacheResponse) {
        // reselect's typed overloads reject a variadic `readonly unknown[]`
        // spread; the runtime contract guarantees the patched args match one
        // overload. Loosen only selectorCreator's call signature — the result
        // is still checked against `cacheResponse`'s `UnknownFunction` type.
        cacheResponse = (
          selectorCreator as unknown as (...args: unknown[]) => UnknownFunction
        )(...patchedReselectArgs);
        cache.set(cacheKey, cacheResponse);
      }

      return cacheResponse(...args);
    }

    return Object.assign(selector, {
      getMatchingSelector: (...args: readonly unknown[]) => {
        const [state, ...rest] = args;
        const cacheKey = options.keySelector!(state, ...rest);
        // @NOTE It might update cache hit count in LRU-like caches
        return cache.get(cacheKey);
      },
      removeMatchingSelector: (...args: readonly unknown[]) => {
        const [state, ...rest] = args;
        const cacheKey = options.keySelector!(state, ...rest);
        cache.remove(cacheKey);
      },
      clearCache: () => {
        cache.clear();
      },
      resultFunc,
      dependencies: inputSelectors,
      cache,
      recomputations: () => recomputations,
      resetRecomputations: () => {
        recomputations = 0;
      },
      keySelector: options.keySelector,
    });
  };
}) as CreateCachedSelectorImpl;

// `Object.assign` keeps `createCachedSelectorImpl` callable while attaching
// the `withTypes` property; a plain object spread (`{ ...fn }`) would only
// copy the function's own enumerable props (none) and produce a non-callable
// object. `withTypes` only refines the static types; at runtime it returns
// the same creator unchanged (mirrors reselect's implementation).
const createCachedSelector: CreateCachedSelector = Object.assign(
  createCachedSelectorImpl,
  { withTypes: () => createCachedSelector },
);

export default createCachedSelector;
