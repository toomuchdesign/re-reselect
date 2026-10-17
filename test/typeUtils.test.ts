import { expectTypeOf } from 'expect-type';
import { describe, it } from 'vitest';

import type {
  LastOf,
  SelectorsObjectToTuple,
  TuplifyUnion,
  UnionToIntersection,
} from '../src/typeUtils';

describe('typeUtils', () => {
  describe('UnionToIntersection', () => {
    it('merges a union into an intersection', () => {
      expectTypeOf<UnionToIntersection<{ a: 1 } | { b: 2 }>>().toEqualTypeOf<
        {
          a: 1;
        } & { b: 2 }
      >();
    });

    it('leaves a single member untouched', () => {
      expectTypeOf<UnionToIntersection<{ a: 1 }>>().toEqualTypeOf<{ a: 1 }>();
    });
  });

  describe('LastOf', () => {
    it('extracts the last member of a union', () => {
      expectTypeOf<LastOf<'a' | 'b' | 'c'>>().toEqualTypeOf<'c'>();
    });

    it('returns the value itself for a single member', () => {
      expectTypeOf<LastOf<'a'>>().toEqualTypeOf<'a'>();
    });
  });

  describe('TuplifyUnion', () => {
    it('turns an empty union (never) into an empty tuple', () => {
      expectTypeOf<TuplifyUnion<never>>().toEqualTypeOf<[]>();
    });

    it('turns a single member into a one-element tuple', () => {
      expectTypeOf<TuplifyUnion<'a'>>().toEqualTypeOf<['a']>();
    });

    it('turns a union into an ordered tuple', () => {
      expectTypeOf<TuplifyUnion<'a' | 'b' | 'c'>>().toEqualTypeOf<
        ['a', 'b', 'c']
      >();
    });
  });

  describe('SelectorsObjectToTuple', () => {
    type State = { a: string; b: number };
    const selectorA = (state: State) => state.a;
    const selectorB = (state: State) => state.b;

    it('converts a selectors object into an ordered selectors tuple', () => {
      type Selectors = { x: typeof selectorA; y: typeof selectorB };
      expectTypeOf<SelectorsObjectToTuple<Selectors>>().toEqualTypeOf<
        [typeof selectorA, typeof selectorB]
      >();
    });

    it('preserves per-position parametric args (no collapse to never)', () => {
      const withParam = (state: State, id: string) => state.a + id;
      type Selectors = { x: typeof selectorA; y: typeof withParam };
      expectTypeOf<SelectorsObjectToTuple<Selectors>>().toEqualTypeOf<
        [typeof selectorA, typeof withParam]
      >();
    });
  });
});
