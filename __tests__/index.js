/* eslint comma-dangle: 0 */
import { createSelector } from 'reselect';
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

  it('Should expose underlying reselect selector for a cache key with getMatchingSelector', () => {
    const cachedSelector = createCachedSelector(
      () => {},
    )(
      (arg1, arg2) => arg2
    );

    // Retrieve result from re-reselect cached selector
    const actualResult = cachedSelector('foo', 1);

    // Retrieve result directly calling underlying reselect selector
    const reselectSelector = cachedSelector.getMatchingSelector('foo', 1);
    const expectedResultFromSelector = reselectSelector('foo', 1);

    expect(actualResult).toBe(expectedResultFromSelector)
  })

  it('Should return "undefined" when getMatchingSelector doesn\'t hit any cache entry', () => {
    const cachedSelector = createCachedSelector(
      memoizedFunction,
    )(
      (arg1, arg2) => arg2   // Resolver
    );

    const actual = cachedSelector.getMatchingSelector('foo', 1);
    const expected = undefined;

    expect(actual).toEqual(expected)
  })

  it('Should reset the cache when calling "clearCache"', () => {
    const cachedSelector = createCachedSelector(
      memoizedFunction,
    )(
      (arg1, arg2) => arg2
    );

    cachedSelector('foo', 1) // add to cache
    cachedSelector.clearCache() // clear cache

    const actual = cachedSelector.getMatchingSelector('foo', 1)
    const expected = undefined

    expect(actual).toEqual(expected)
  })

  it('Should set the selected key to "undefined" when calling "removeCacheKey"', () => {
    const cachedSelector = createCachedSelector(
      memoizedFunction,
    )(
      (arg1, arg2) => arg2
    );

    cachedSelector('foo', 1) // add to cache
    cachedSelector('foo', 2) // add to cache
    cachedSelector.removeCacheKey(1) // remove key from chache

    const firstSelectorActual = cachedSelector.getMatchingSelector('foo', 1)
    const secondSelectorActual = cachedSelector.getMatchingSelector('foo', 2)
    const expected = undefined

    expect(firstSelectorActual).toEqual(expected)
    expect(secondSelectorActual).not.toEqual(expected)
  })
});
