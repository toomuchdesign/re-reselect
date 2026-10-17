import type {
  Combiner,
  CreateSelectorFunction,
  CreateSelectorOptions,
  GetParamsFromSelectors,
  GetStateFromSelectors,
  OutputSelector,
  Selector,
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
  keySelector?: TypedKeySelector<InputSelectors>;
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
 *
 * This type is reconstructed from a plain reselect `Selector` plus **only** the
 * members re-reselect actually attaches at runtime (see
 * `createCachedSelector.ts`'s `Object.assign`). It intentionally does **not**
 * inherit reselect's full `OutputSelector`: that would advertise members which
 * only exist on the inner, per-cache-key reselect selectors (`memoizedResultFunc`,
 * `lastResult`, `dependencyRecomputations`, `resetDependencyRecomputations`,
 * `memoize`, `argsMemoize`, …) — they are absent on the cached selector at
 * runtime, so surfacing them would type-check and then crash.
 *
 * `getMatchingSelector` returns the full `OutputSelector` because the inner
 * cached selector genuinely is a reselect selector.
 *
 * `.keySelector` is exposed using the loose `KeySelector<State>` shape rather
 * than the precise `TypedKeySelector<InputSelectors>` for back-compat with
 * consumers that test the type against `KeySelector<State>`.
 */
export type OutputCachedSelector<
  InputSelectors extends SelectorArray,
  Result,
> = Selector<
  GetStateFromSelectors<InputSelectors>,
  Result,
  GetParamsFromSelectors<InputSelectors>
> &
  // Re-use reselect's own field types, but `Pick` only the ones re-reselect
  // actually attaches at runtime. The call signature is supplied by the
  // `Selector<…>` base above, since it can't be `Pick`ed off `OutputSelector`.
  Pick<
    OutputSelector<InputSelectors, Result>,
    'resultFunc' | 'dependencies' | 'recomputations' | 'resetRecomputations'
  > & {
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
 * Just the callable signatures of `createCachedSelector`, without `withTypes`.
 * Split out so the runtime implementation can be typed against it directly
 * (TypeScript's `Omit` strips call signatures, so this can't be derived from
 * `CreateCachedSelector` after the fact).
 *
 * Three overloads (variadic, variadic+options, array+options) using tuple
 * inference instead of per-arity overload duplication, mirroring reselect's
 * `CreateSelectorFunction` pattern.
 *
 * `StateType` is the state type shared by all input selectors. It defaults to
 * `any` and is narrowed via `withTypes` to pre-type the selector creator.
 */
export interface CreateCachedSelectorImpl<StateType = any> {
  <InputSelectors extends SelectorArray<StateType>, Result>(
    ...createSelectorArgs: [
      ...inputSelectors: InputSelectors,
      combiner: Combiner<InputSelectors, Result>,
    ]
  ): (
    polymorphicOptions: PolymorphicCachedOptions<InputSelectors, Result>,
  ) => OutputCachedSelector<InputSelectors, Result>;

  <InputSelectors extends SelectorArray<StateType>, Result>(
    ...createSelectorArgs: [
      ...inputSelectors: InputSelectors,
      combiner: Combiner<InputSelectors, Result>,
      createSelectorOptions: CreateSelectorOptions,
    ]
  ): (
    polymorphicOptions: PolymorphicCachedOptions<InputSelectors, Result>,
  ) => OutputCachedSelector<InputSelectors, Result>;

  <InputSelectors extends SelectorArray<StateType>, Result>(
    inputSelectors: [...InputSelectors],
    combiner: Combiner<InputSelectors, Result>,
    createSelectorOptions?: CreateSelectorOptions,
  ): (
    polymorphicOptions: PolymorphicCachedOptions<InputSelectors, Result>,
  ) => OutputCachedSelector<InputSelectors, Result>;
}

/**
 * The full `createCachedSelector` surface: callable signatures plus the
 * `withTypes` helper for pre-typing the state.
 */
export interface CreateCachedSelector<
  StateType = any,
> extends CreateCachedSelectorImpl<StateType> {
  /**
   * Creates a "pre-typed" version of `createCachedSelector` where the `state`
   * type is predefined.
   *
   * This lets you set the `state` type once, removing the need to specify it
   * on every input selector across all `createCachedSelector` calls.
   *
   * @returns A pre-typed `createCachedSelector` with the state type baked in.
   */
  withTypes: <
    OverrideStateType extends StateType,
  >() => CreateCachedSelector<OverrideStateType>;
}
