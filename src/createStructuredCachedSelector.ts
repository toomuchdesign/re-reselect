import type { Selector, SelectorResultsMap, SelectorsObject } from 'reselect';

import createCachedSelector from './createCachedSelector';
import { createStructuredSelector } from './reselectWrapper';
import type { OutputCachedSelector, PolymorphicCachedOptions } from './types';

/**
 * Type-level `Object.values()`: converts a SelectorsObject
 * `{ foo: Selector, bar: Selector }` into the ordered tuple
 * `[Selector, Selector]` that reselect's `MergeParameters` needs to infer
 * state and params. An unordered `Array<T[keyof T]>` collapses the selectors
 * to a union and loses per-position params (second args resolve to `never`),
 * so a real tuple is required. Mirrors reselect's internal
 * `ObjectValuesToTuple` (not exported from the package).
 */
type UnionToIntersection<Union> = (
  Union extends unknown ? (distributedUnion: Union) => void : never
) extends (mergedIntersection: infer Intersection) => void
  ? Intersection
  : never;
type LastOf<T> =
  UnionToIntersection<T extends any ? () => T : never> extends () => infer R
    ? R
    : never;
type TuplifyUnion<
  T,
  L = LastOf<T>,
  N = [T] extends [never] ? true : false,
> = true extends N ? [] : [...TuplifyUnion<Exclude<T, L>>, L];
type SelectorsObjectToTuple<
  T extends SelectorsObject<any>,
  KS extends any[] = TuplifyUnion<keyof T>,
  R extends Selector[] = [],
> = KS extends [infer K, ...infer KT]
  ? SelectorsObjectToTuple<T, KT, [...R, T[K & keyof T]]>
  : R;

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
