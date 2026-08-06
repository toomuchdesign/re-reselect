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

  // @ts-expect-error single point of variadic-to-typed narrowing. The public
  // overloads guarantee shapes at compile time; the runtime impl reconstructs
  // them from the erased argv.
  return { inputSelectors, resultFunc, createSelectorOptions };
}

// @ts-expect-error the impl's variadic single signature cannot directly
// satisfy `CreateCachedSelectorImpl`'s three precisely-typed overloads;
// public callers see the typed surface, the body operates on erased args.
const createCachedSelectorImpl: CreateCachedSelectorImpl = (
  ...reselectArgs: readonly unknown[]
): unknown => {
  const { inputSelectors, resultFunc, createSelectorOptions } =
    parseReselectArgs(reselectArgs);

  return (
    polymorphicOptions: PolymorphicCachedOptions<SelectorArray, unknown>,
  ) => {
    const options: CreateCachedSelectorOptions<SelectorArray, unknown> =
      isFunction(polymorphicOptions)
        ? { keySelector: polymorphicOptions }
        : polymorphicOptions;

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

    if (options.keySelectorCreator) {
      options.keySelector = options.keySelectorCreator({
        keySelector: options.keySelector,
        inputSelectors,
        resultFunc,
      });
    }

    // Hoisted out of the call: resolving `options.keySelector` per invocation is a
    // property load on a shared object in the hottest path in the library.
    const keySelector = options.keySelector as UnknownFunction;

    /**
     * Selectors are reached as `(state)` or `(state, props)` in all but exotic
     * cases, and those two arities are dispatched directly.
     *
     * A rest parameter allocates an array on every call, and forwarding it costs a
     * spread at each of the two call sites below — all of it paid on a cache hit,
     * which is what the overwhelming majority of calls are. The arity is matched
     * exactly rather than always forwarding two arguments, because reselect memoizes
     * on the argument list and handing a one-argument selector a second `undefined`
     * would change its cache key.
     */
    function selector(state: unknown, props?: unknown): unknown {
      const argumentCount = arguments.length;

      const cacheKey =
        argumentCount === 2
          ? keySelector(state, props)
          : argumentCount === 1
            ? keySelector(state)
            : keySelector.apply(null, arguments as unknown as unknown[]);

      // Invoked as a method on the cache rather than through a detached reference,
      // so an implementation whose validator reads `this` — a tree-shaped cache
      // consulting its own root, say — is callable at all. Reading the property per
      // call also lets a cache install or replace its validator after the selector
      // has been created.
      if (
        cache.isValidCacheKey !== undefined &&
        !cache.isValidCacheKey(cacheKey)
      ) {
        console.warn(
          `[re-reselect] Invalid cache key "${String(
            cacheKey,
          )}" has been returned by keySelector function.`,
        );
        return undefined;
      }

      let cacheResponse: UnknownFunction | undefined = cache.get(cacheKey);

      if (!cacheResponse) {
        // @ts-expect-error reselect's typed overloads reject a variadic
        // `readonly unknown[]` spread; the runtime contract guarantees
        // the patched args match one of the overloads.
        cacheResponse = selectorCreator(...patchedReselectArgs);
        cache.set(cacheKey, cacheResponse);
      }

      return argumentCount === 2
        ? cacheResponse(state, props)
        : argumentCount === 1
          ? cacheResponse(state)
          : cacheResponse.apply(null, arguments as unknown as unknown[]);
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
};

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
