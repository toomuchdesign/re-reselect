import type { SelectorResultsMap, SelectorsObject } from 'reselect';

import { createCachedSelector } from './createCachedSelector';
import { createStructuredSelector } from './reselectWrapper';
import type { SelectorsObjectToTuple } from './typeUtils';
import type { OutputCachedSelector, PolymorphicCachedOptions } from './types';

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
    SelectorsObjectToTuple<InputSelectorsObject>,
    SelectorResultsMap<InputSelectorsObject>
  >,
) => OutputCachedSelector<
  SelectorsObjectToTuple<InputSelectorsObject>,
  SelectorResultsMap<InputSelectorsObject>
>;

export function createStructuredCachedSelector<
  InputSelectorsObject extends SelectorsObject<any>,
>(
  selectors: InputSelectorsObject,
): StructuredCachedSelector<InputSelectorsObject> {
  return createStructuredSelector(
    selectors,
    createCachedSelector as never,
  ) as unknown as StructuredCachedSelector<InputSelectorsObject>;
}
