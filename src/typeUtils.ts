import type { Selector, SelectorsObject } from 'reselect';

/**
 * Distributes a union `A | B | C` into an intersection `A & B & C` by exploiting
 * contravariance of function parameters. Building block for {@link LastOf}.
 */
export type UnionToIntersection<Union> = (
  Union extends unknown ? (distributedUnion: Union) => void : never
) extends (mergedIntersection: infer Intersection) => void
  ? Intersection
  : never;

/**
 * Extracts the "last" member of a union. Order is an implementation detail of
 * the compiler's overload resolution, but it is stable, which is all
 * {@link TuplifyUnion} needs to peel members off one at a time.
 */
export type LastOf<T> =
  UnionToIntersection<T extends any ? () => T : never> extends () => infer R
    ? R
    : never;

/**
 * Converts a union `A | B | C` into a tuple `[A, B, C]` by repeatedly pulling
 * off {@link LastOf} and excluding it until the union is `never`.
 */
export type TuplifyUnion<
  T,
  L = LastOf<T>,
  N = [T] extends [never] ? true : false,
> = true extends N ? [] : [...TuplifyUnion<Exclude<T, L>>, L];

/**
 * Type-level `Object.values()`: converts a SelectorsObject
 * `{ foo: Selector, bar: Selector }` into the ordered tuple
 * `[Selector, Selector]` that reselect's `MergeParameters` needs to infer
 * state and params. An unordered `Array<T[keyof T]>` collapses the selectors
 * to a union and loses per-position params (second args resolve to `never`),
 * so a real tuple is required. Mirrors reselect's internal
 * `ObjectValuesToTuple` (not exported from the package).
 */
export type SelectorsObjectToTuple<
  T extends SelectorsObject<any>,
  KS extends any[] = TuplifyUnion<keyof T>,
  R extends Selector[] = [],
> = KS extends [infer K, ...infer KT]
  ? SelectorsObjectToTuple<T, KT, [...R, T[K & keyof T]]>
  : R;
