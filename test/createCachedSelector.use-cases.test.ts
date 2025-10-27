import { expectTypeOf } from 'expect-type';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createCachedSelector } from '../src/index';
import * as reselect from '../src/reselectWrapper';

beforeEach(() => {
  vi.spyOn(reselect, 'createSelector');
  vi.spyOn(global.console, 'warn').mockImplementation(() => {});
});

describe('createCachedSelector use cases', () => {
  describe('nested cached input selectors', () => {
    it('works', () => {
      type State = { foo: string; bar: number; baz: boolean };

      const nestedSelector = createCachedSelector(
        [(state: State) => state.foo, (state: State) => state.bar],
        (foo, bar) => ({ foo, bar }),
      )((state: State) => state.foo);

      const selector = createCachedSelector(
        [nestedSelector, (state) => state.baz],
        (result1, result2) => {
          expectTypeOf(result1).toEqualTypeOf<{ foo: string; bar: number }>();
          expectTypeOf(result2).toBeBoolean();

          return [result1.foo, result1.bar, result2];
        },
      )((state: State) => state.bar);

      const actual = selector({
        foo: 'aaa',
        bar: 123,
        baz: true,
      });
      expect(actual).toEqual(['aaa', 123, true]);
      expectTypeOf(actual).toEqualTypeOf<(string | number | boolean)[]>();
    });
  });

  describe('multiple parametric selectors', () => {
    it('works', () => {
      type State = { foo: string };
      type Props = { bar: number };

      const selector = createCachedSelector(
        (state) => state.foo,
        (state) => state.foo,
        (state: State) => state.foo,
        (state) => state.foo,
        (state) => state.foo,
        (state) => state.foo,
        (state: State) => state.foo,
        (state) => state.foo,
        (state) => state.foo,
        (state: State, props: Props) => props.bar,

        (
          input1,
          input2,
          input3,
          input4,
          input5,
          input6,
          input7,
          input8,
          input9,
          input10,
        ) => {
          expectTypeOf(input1).toBeString();
          expectTypeOf(input2).toBeString();
          expectTypeOf(input3).toBeString();
          expectTypeOf(input4).toBeString();
          expectTypeOf(input5).toBeString();
          expectTypeOf(input6).toBeString();
          expectTypeOf(input7).toBeString();
          expectTypeOf(input8).toBeString();
          expectTypeOf(input9).toBeString();
          expectTypeOf(input10).toBeNumber();

          return {
            input1,
            input2,
            input3,
            input4,
            input5,
            input6,
            input7,
            input8,
            input9,
            input10,
          };
        },
      )((state, props) => {
        expectTypeOf(state).toEqualTypeOf<State>();
        expectTypeOf(props).toEqualTypeOf<Props>();

        return props.bar;
      });

      selector(
        { foo: 'fizz' },
        {
          // @ts-expect-error
          bar: 'wrong-argument',
        },
      );

      const actual = selector({ foo: 'fizz' }, { bar: 42 });
      expect(actual).toEqual({
        input1: 'fizz',
        input2: 'fizz',
        input3: 'fizz',
        input4: 'fizz',
        input5: 'fizz',
        input6: 'fizz',
        input7: 'fizz',
        input8: 'fizz',
        input9: 'fizz',
        input10: 42,
      });

      expectTypeOf(actual).toEqualTypeOf<{
        input1: string;
        input2: string;
        input3: string;
        input4: string;
        input5: string;
        input6: string;
        input7: string;
        input8: string;
        input9: string;
        input10: number;
      }>();
    });
  });

  describe('multiple array selectors', () => {
    it('works', () => {
      type State = { foo: string };
      type Props = { bar: number };

      const selector = createCachedSelector(
        [
          (state) => state.foo,
          (state) => state.foo,
          (state: State) => state.foo,
          (state) => state.foo,
          (state) => state.foo,
          (state: State) => state.foo,
          (state) => state.foo,
          (state) => state.foo,
          (state) => state.foo,
          (state: State, props: Props) => props.bar,
        ],

        (
          input1,
          input2,
          input3,
          input4,
          input5,
          input6,
          input7,
          input8,
          input9,
          input10,
        ) => {
          expectTypeOf(input1).toBeString();
          expectTypeOf(input2).toBeString();
          expectTypeOf(input3).toBeString();
          expectTypeOf(input4).toBeString();
          expectTypeOf(input5).toBeString();
          expectTypeOf(input6).toBeString();
          expectTypeOf(input7).toBeString();
          expectTypeOf(input8).toBeString();
          expectTypeOf(input9).toBeString();
          expectTypeOf(input10).toBeNumber();

          return {
            input1,
            input2,
            input3,
            input4,
            input5,
            input6,
            input7,
            input8,
            input9,
            input10,
          };
        },
      )((state, props) => {
        expectTypeOf(state).toEqualTypeOf<State>();
        expectTypeOf(props).toEqualTypeOf<Props>();

        return props.bar;
      });

      selector(
        { foo: 'fizz' },
        {
          // @ts-expect-error
          bar: 'wrong-argument',
        },
      );

      const actual = selector({ foo: 'fizz' }, { bar: 42 });
      expect(actual).toEqual({
        input1: 'fizz',
        input2: 'fizz',
        input3: 'fizz',
        input4: 'fizz',
        input5: 'fizz',
        input6: 'fizz',
        input7: 'fizz',
        input8: 'fizz',
        input9: 'fizz',
        input10: 42,
      });

      expectTypeOf(actual).toEqualTypeOf<{
        input1: string;
        input2: string;
        input3: string;
        input4: string;
        input5: string;
        input6: string;
        input7: string;
        input8: string;
        input9: string;
        input10: number;
      }>();
    });
  });
});
