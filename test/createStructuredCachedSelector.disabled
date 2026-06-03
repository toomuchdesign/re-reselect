import { expectTypeOf } from 'expect-type';
import { describe, expect, it } from 'vitest';

import { createStructuredCachedSelector } from '../src/index';

function assertType<T>(value: T): T {
  return value;
}

describe('createStructuredCachedSelector', () => {
  it('returns expected cachedSelector', () => {
    type State = {
      a: string;
      b: number;
    };
    // Example taken from https://github.com/reduxjs/reselect/tree/v4.0.0#createstructuredselectorinputselectors-selectorcreator--createselector
    const mySelectorA = (state: State) => state.a;
    const mySelectorB = (state: State) => state.b;
    const keySelector = (state: State) => state.a;

    const structuredSelector = createStructuredCachedSelector({
      x: mySelectorA,
      y: mySelectorB,
    })(keySelector);

    expect(structuredSelector({ a: 'moo', b: 101 })).toEqual({
      x: 'moo',
      y: 101,
    });

    // dependencies
    expect(structuredSelector.dependencies).toEqual([mySelectorA, mySelectorB]);

    // Dependencies
    const expectedResultFunc = (a: string, b: number) => ({ x: a, y: b });
    expect(structuredSelector.resultFunc('foo', 10)).toEqual(
      expectedResultFunc('foo', 10),
    );

    // keySelector
    expect(structuredSelector.keySelector).toBe(keySelector);
  });

  describe('types', () => {
    it('exposes expected types', () => {
      interface State {
        a: string;
        b: string;
      }
      interface Result {
        x: string;
        y: string;
      }

      // 1. Infer selector type based on the selector functions.
      const mySelectorA = (state: State) => state.a;
      const mySelectorB = (state: State) => state.b;
      const selector1 = createStructuredCachedSelector({
        x: mySelectorA,
        y: mySelectorB,
      })((state) => {
        expectTypeOf(state.a).toBeString();
        return state.a;
      });

      expectTypeOf(selector1).parameters.toEqualTypeOf<[State]>();
      expectTypeOf(selector1).returns.toEqualTypeOf<Result>();
    });

    describe('parametric', () => {
      it('exposes expected types', () => {
        interface State {
          a: string;
          items: { [key: string]: string };
        }
        interface Result {
          x: string;
          y: string;
        }

        // 1.1 Infer selector type based on the selector functions. Selectors have the same signature.
        const mySelectorA = (state: State, id: string) => state.a;
        const mySelectorB = (state: State, id: string) => state.items[id];
        const selector1 = createStructuredCachedSelector({
          x: mySelectorA,
          y: mySelectorB,
        })((state, id) => {
          expectTypeOf(id).toBeString();
          return id;
        });

        expectTypeOf(selector1).parameters.toEqualTypeOf<
          [State, string, ...any[]]
        >;
        expectTypeOf(selector1).returns.toEqualTypeOf<Result>();

        // 1.2 Infer selector type based on the selector functions. One selector doesn't have a param.
        const mySelectorC = (state: State) => state.a;
        const mySelectorD = (state: State, id: string) => state.items[id];
        const selector2 = createStructuredCachedSelector({
          x: mySelectorC,
          y: mySelectorD,
        })((state, id) => assertType<string>(id));

        expectTypeOf(selector2).parameters.toEqualTypeOf<
          [State, string, ...any[]]
        >();
        expectTypeOf(selector2).returns.toEqualTypeOf<Result>();

        // 1.3 One selector has an *optional* second param.
        // See https://github.com/toomuchdesign/re-reselect/issues/155
        // The resulting selector must accept the props argument as optional:
        // both `selector3(state)` and `selector3(state, id)` must type-check.
        const mySelectorE = (state: State) => state.a;
        const mySelectorF = (state: State, id?: string) =>
          id ? state.items[id] : state.a;
        const selector3 = createStructuredCachedSelector({
          x: mySelectorE,
          y: mySelectorF,
        })((state, id?: string) => id ?? '');

        const state: State = { a: 'foo', items: { id1: 'bar' } };
        // Both call signatures must be valid (this is the actual bug repro).
        expectTypeOf(selector3(state)).toEqualTypeOf<Result>();
        expectTypeOf(selector3(state, 'id1')).toEqualTypeOf<Result>();

        expectTypeOf(selector3).parameters.toEqualTypeOf<
          [State, (string | undefined)?, ...any[]]
        >();
        expectTypeOf(selector3).returns.toEqualTypeOf<Result>();

        // 2. Explicitly set State and Parameter types for all selector functions
        // => not supported
      });
    });
  });
});
