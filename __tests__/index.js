/* eslint comma-dangle: 0 */
import createCachedSelector from '../index';

let memoizedFunction;

beforeEach(() => {
  memoizedFunction = jest.fn();
});

describe('createCachedSelector', () => {
  it('Should use the same cached selector when resolver function returns the same string', () => {
    const cachedSelector = createCachedSelector(
        memoizedFunction,
    )(
        (arg1, arg2) => arg2,   // Resolver
    );
    const firstCall = cachedSelector('foo', 'bar');
    const secondCallWithSameResolver = cachedSelector('foo', 'bar');

    expect(memoizedFunction.mock.calls.length).toBe(1);
  });

  it('Should create 2 different selectors when resolver function returns different strings', () => {
    const cachedSelector = createCachedSelector(
        memoizedFunction,
    )(
        (arg1, arg2) => arg2,   // Resolver
    );
    const firstCallResult = cachedSelector('foo', 'bar');
    const secondCallWithDifferentResolver = cachedSelector('foo', 'moo');

    expect(memoizedFunction.mock.calls.length).toBe(2);
  });

  it('Should return "undefined" if provided resolver does not return a string', () => {
    const cachedSelector = createCachedSelector(
        memoizedFunction,
    )(
        () => {},   // Resolver
    );
    const firstCallResult = cachedSelector('foo', 'bar');

    expect(memoizedFunction.mock.calls.length).toBe(0);
    expect(firstCallResult).toBe(undefined);
  });

  it('Should allow resolver function to return keys of type number', () => {
    const cachedSelector = createCachedSelector(
        memoizedFunction,
    )(
        (arg1, arg2) => arg2,   // Resolver
    );
    const firstCall = cachedSelector('foo', 1);
    const secondCallWithSameResolver = cachedSelector('foo', 1);

    expect(memoizedFunction.mock.calls.length).toBe(1);
  });
});
