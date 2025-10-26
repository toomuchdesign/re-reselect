import { describe, expect, it } from 'vitest';

import { createStructuredCachedSelector } from '../src/index';

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
});
