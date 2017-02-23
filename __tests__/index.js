/* eslint comma-dangle: 0 */
import createCachedSelector from '../index';

let memoizedFunction;

beforeEach(() => {
  memoizedFunction = jest.fn();
});

describe('createCachedSelector', () => {
  it('Should use the same cached selector when resolver function returns the same string', () => {
    const cachedSelector = createCachedSelector(
      (arg1, arg2) => arg2,   // Resolver
    )(
      memoizedFunction,
    );
    const firstCall = cachedSelector('foo', 'bar');
    const secondCallWithSameResolver = cachedSelector('foo', 'bar');

    expect(memoizedFunction.mock.calls.length).toBe(1);
  });

  it('Should create 2 different selectors when resolver function returns different strings', () => {
    const cachedSelector = createCachedSelector(
      (arg1, arg2) => arg2,   // Resolver
    )(
      memoizedFunction,
    );
    const firstCallResult = cachedSelector('foo', 'bar');
    const secondCallWithDifferentResolver = cachedSelector('foo', 'moo');

    expect(memoizedFunction.mock.calls.length).toBe(2);
  });
});
