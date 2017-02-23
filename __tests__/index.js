/* eslint comma-dangle: 0 */
import createCachedSelector from '../index';

describe('createCachedSelector', () => {
  it('Should return the same cached reselect selector when resolver function returns the same string', () => {
    const cachedSelector = createCachedSelector(
      (arg1, arg2) => arg2,   // Resolver
    )(
      () => ({}),
    );
    const firstCallResult = cachedSelector('foo', 'bar');
    const secondCallResult = cachedSelector('foo', 'bar');

    expect(firstCallResult).toBe(secondCallResult);
    expect(firstCallResult).toEqual({});
  });

  it('Should return 2 different reselect selector instances when resolver function returns different strings', () => {
    const cachedSelector = createCachedSelector(
      (arg1, arg2) => arg2,   // Resolver
    )(
      () => ({}),
    );
    const firstCallResult = cachedSelector('foo', 'bar');
    const secondCallResult = cachedSelector('foo', 'moo');

    expect(firstCallResult).not.toBe(secondCallResult);
    expect(firstCallResult).toEqual({});
  });
});
