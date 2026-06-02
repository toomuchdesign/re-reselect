import type {
  Combiner,
  CreateSelectorFunction,
  CreateSelectorOptions,
  GetParamsFromSelectors,
  GetStateFromSelectors,
  OutputSelector,
  SelectorArray,
} from 'reselect';

import type { ICacheObject } from './cache/types';

/**
 * A function which takes the same arguments as the selector and returns a cacheKey.
 * The cacheKey is used to look up the matching reselect selector in the cache.
 */
export type KeySelector<S> = (state: S, ...args: any[]) => any;

/**
 * keySelector type with parameters inferred from the parent selector's input selectors.
 * Used to give precise types to the user-supplied keySelector callback at call sites.
 */
export type TypedKeySelector<InputSelectors extends SelectorArray> = (
  state: GetStateFromSelectors<InputSelectors>,
  ...params: GetParamsFromSelectors<InputSelectors>
) => unknown;

/**
 * A function which receives the selector's inputSelectors/resultFunc/keySelector
 * and returns the keySelector to be used at runtime.
 */
export type KeySelectorCreator<
  InputSelectors extends SelectorArray,
  Result,
> = (selectorInputs: {
  inputSelectors: InputSelectors;
  resultFunc: Combiner<InputSelectors, Result>;
  keySelector: TypedKeySelector<InputSelectors> | undefined;
}) => TypedKeySelector<InputSelectors>;

export type CreateCachedSelectorOptions<
  InputSelectors extends SelectorArray,
  Result,
> = {
  keySelector?: TypedKeySelector<InputSelectors>;
  cacheObject?: ICacheObject;
  selectorCreator?: CreateSelectorFunction<any, any, any>;
  keySelectorCreator?: KeySelectorCreator<InputSelectors, Result>;
};

/**
 * The selector instance returned by `createCachedSelector(...)(...)`.
 * Extends reselect's OutputSelector with cache-management methods.
 *
 * `.keySelector` is exposed using the loose `KeySelector<State>` shape rather
 * than the precise `TypedKeySelector<InputSelectors>` for back-compat with
 * consumers that test the type against `KeySelector<State>`.
 */
export type OutputCachedSelector<
  InputSelectors extends SelectorArray,
  Result,
> = OutputSelector<InputSelectors, Result> & {
  getMatchingSelector: (
    ...args: Parameters<OutputSelector<InputSelectors, Result>>
  ) => OutputSelector<InputSelectors, Result>;
  removeMatchingSelector: (
    ...args: Parameters<OutputSelector<InputSelectors, Result>>
  ) => void;
  clearCache: () => void;
  cache: ICacheObject;
  keySelector: KeySelector<GetStateFromSelectors<InputSelectors>>;
};

/**
 * The curried second-call argument: a `keySelector` function or an options object.
 */
export type PolymorphicCachedOptions<
  InputSelectors extends SelectorArray,
  Result,
> =
  | TypedKeySelector<InputSelectors>
  | CreateCachedSelectorOptions<InputSelectors, Result>;

/**
 * Mirrors reselect's `CreateSelectorFunction` pattern: a single interface
 * with three overloads (variadic, variadic+options, array+options) using
 * tuple inference instead of per-arity overload duplication.
 */
export interface CreateCachedSelectorFunction {
  <InputSelectors extends SelectorArray, Result>(
    ...createSelectorArgs: [
      ...inputSelectors: InputSelectors,
      combiner: Combiner<InputSelectors, Result>,
    ]
  ): (
    polymorphicOptions: PolymorphicCachedOptions<InputSelectors, Result>,
  ) => OutputCachedSelector<InputSelectors, Result>;

  <InputSelectors extends SelectorArray, Result>(
    ...createSelectorArgs: [
      ...inputSelectors: InputSelectors,
      combiner: Combiner<InputSelectors, Result>,
      createSelectorOptions: CreateSelectorOptions,
    ]
  ): (
    polymorphicOptions: PolymorphicCachedOptions<InputSelectors, Result>,
  ) => OutputCachedSelector<InputSelectors, Result>;

  <InputSelectors extends SelectorArray, Result>(
    inputSelectors: [...InputSelectors],
    combiner: Combiner<InputSelectors, Result>,
    createSelectorOptions?: CreateSelectorOptions,
  ): (
    polymorphicOptions: PolymorphicCachedOptions<InputSelectors, Result>,
  ) => OutputCachedSelector<InputSelectors, Result>;
}
