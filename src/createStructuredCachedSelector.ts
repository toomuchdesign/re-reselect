import type { Selector, SelectorResultsMap, SelectorsObject } from 'reselect';

import createCachedSelector from './createCachedSelector';
import { createStructuredSelector } from './reselectWrapper';
import type { OutputCachedSelector, PolymorphicCachedOptions } from './types';

/**
 * Convert a SelectorsObject `{ foo: Selector, bar: Selector }` to the tuple
 * `[Selector, Selector]` that reselect's input-selector inference expects.
 * `keyof T` is unordered, but for tuple inference reselect only needs the
 * union of selectors — `Array<T[keyof T]>` is sufficient for state/params
 * extraction via `MergeParameters`.
 */
type SelectorsObjectToTuple<T extends SelectorsObject<any>> = Array<T[keyof T]>;

type StructuredCachedSelectorState<T extends SelectorsObject<any>> =
  T extends SelectorsObject<infer S> ? S : never;

/**
 * The returned thunk preserves the cached-selector public surface
 * (`getMatchingSelector`, `removeMatchingSelector`, `clearCache`, `cache`,
 * `keySelector`, plus reselect's `OutputSelector` fields) and exposes
 * the structured shape as the selector's `Result`.
 */
type StructuredCachedSelector<
  InputSelectorsObject extends SelectorsObject<any>,
> = (
  polymorphicOptions: PolymorphicCachedOptions<
    SelectorsObjectToTuple<InputSelectorsObject> &
      ReadonlyArray<Selector<StructuredCachedSelectorState<InputSelectorsObject>>>,
    SelectorResultsMap<InputSelectorsObject>
  >,
) => OutputCachedSelector<
  SelectorsObjectToTuple<InputSelectorsObject> &
    ReadonlyArray<Selector<StructuredCachedSelectorState<InputSelectorsObject>>>,
  SelectorResultsMap<InputSelectorsObject>
>;

function createStructuredCachedSelector<
  InputSelectorsObject extends SelectorsObject<any>,
>(
  selectors: InputSelectorsObject,
): StructuredCachedSelector<InputSelectorsObject> {
  return createStructuredSelector(
    selectors,
    createCachedSelector as never,
  ) as unknown as StructuredCachedSelector<InputSelectorsObject>;
}

export default createStructuredCachedSelector;
