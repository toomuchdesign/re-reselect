import {createStructuredCachedSelector} from '../index';

describe('createStructuredCachedSelector', () => {
  it('returns expected cachedSelector', () => {
    // Example taken from https://github.com/reduxjs/reselect/tree/v4.0.0#createstructuredselectorinputselectors-selectorcreator--createselector
    const mySelectorA = state => state.a;
    const mySelectorB = state => state.b;
    const keySelector = state => state.a;

    const structuredSelector = createStructuredCachedSelector({
      x: mySelectorA,
      y: mySelectorB,
    })(keySelector);

    const expectedInputSelectors = [mySelectorA, mySelectorB];
    const expectedResultFunc = (a, b) => ({x: a, y: b});

    expect(structuredSelector.dependencies).toEqual(expectedInputSelectors);
    expect(structuredSelector.resultFunc('foo', 'bar')).toEqual(
      expectedResultFunc('foo', 'bar')
    );
    expect(structuredSelector.keySelector).toBe(keySelector);
  });
});
