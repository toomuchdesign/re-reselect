/* eslint comma-dangle: 0 */
import {createSelector} from 'reselect';
import createCachedSelector, {FlatCacheObject} from '../index';

let resultFunc;

beforeEach(() => {
  resultFunc = jest.fn();
});

function selectorWithMockedResultFunc() {
  return createCachedSelector(resultFunc)(
    (arg1, arg2) => arg2 // Resolver
  );
}

describe('createCachedSelector', () => {
  it('Should use the same cached selector when resolver function returns the same value', () => {
    const cachedSelector = selectorWithMockedResultFunc();
    const firstCall = cachedSelector('foo', 'bar');
    const secondCallWithSameResolver = cachedSelector('foo', 'bar');

    expect(resultFunc).toHaveBeenCalledTimes(1);
  });

  it('Should create 2 selectors when resolver function returns different values', () => {
    const cachedSelector = selectorWithMockedResultFunc();
    const firstCallResult = cachedSelector('foo', 'bar');
    const secondCallWithDifferentResolver = cachedSelector('foo', 'moo');

    expect(resultFunc).toHaveBeenCalledTimes(2);
  });

  describe('cacheKey validity check', () => {
    it('Should return "undefined" if resolver does not return a string or number', () => {
      const cachedSelector = selectorWithMockedResultFunc();
      const results = [
        cachedSelector('foo', {}),
        cachedSelector('foo', []),
        cachedSelector('foo', null),
        cachedSelector('foo', undefined),
      ];

      expect(resultFunc).toHaveBeenCalledTimes(0);

      results.forEach(result => expect(result).toBe(undefined));
    });

    it('Should allow resolver function to return keys of type number', () => {
      const cachedSelector = selectorWithMockedResultFunc();
      const firstCall = cachedSelector('foo', 1);
      const secondCall = cachedSelector('foo', 1);

      expect(resultFunc).toHaveBeenCalledTimes(1);
    });

    it('Should run a custom cacheKey check when cacheObject.isCacheKeyValid provides one', () => {
      const cacheObject = new FlatCacheObject();
      cacheObject.isCacheKeyValid = jest.fn(() => true);
      cacheObject.set = jest.fn();

      const cachedSelector = createCachedSelector(resultFunc)(
        (arg1, arg2) => arg2,
        {
          cacheObject: cacheObject,
        }
      );

      cachedSelector('foo', {});

      expect(cacheObject.isCacheKeyValid).toHaveBeenCalledTimes(1);
      expect(cacheObject.set).toHaveBeenCalledTimes(1);
      // Receive cacheKey and reselect selector as arguments
      expect(cacheObject.set).toHaveBeenCalledWith({}, expect.any(Function));
    });
  });

  it('Should accept a "selectorCreator" function as 2° argument', () => {
    const consoleWarnSpy = jest
      .spyOn(global.console, 'warn')
      .mockImplementation(() => {});
    const cachedSelector = createCachedSelector(resultFunc)(
      (arg1, arg2) => arg2,
      createSelector
    );

    expect(resultFunc).toHaveBeenCalledTimes(0);
    cachedSelector('foo', 'bar');
    cachedSelector('foo', 'bar');
    expect(resultFunc).toHaveBeenCalledTimes(1);

    consoleWarnSpy.mockReset();
    consoleWarnSpy.mockRestore();
  });

  it('Should cast a deprecation warning when "selectorCreator" is provided as 2° argument', () => {
    const consoleWarnSpy = jest
      .spyOn(global.console, 'warn')
      .mockImplementation(() => {});
    const cachedSelector = createCachedSelector(
      resultFunc
    )(() => {}, createSelector);

    expect(consoleWarnSpy).toHaveBeenCalled();

    consoleWarnSpy.mockReset();
    consoleWarnSpy.mockRestore();
  });

  it('Should accept an options object', () => {
    const cachedSelector = createCachedSelector(resultFunc)(
      (arg1, arg2) => arg2,
      {
        cacheObject: new FlatCacheObject(),
        selectorCreator: createSelector,
      }
    );

    expect(resultFunc).toHaveBeenCalledTimes(0);
    cachedSelector('foo', 'bar');
    cachedSelector('foo', 'bar');
    expect(resultFunc).toHaveBeenCalledTimes(1);
  });

  describe('getMatchingSelector()', () => {
    it('Should return underlying reselect selector for a given cache key', () => {
      const cachedSelector = createCachedSelector(() => {})(
        (arg1, arg2) => arg2
      );

      // Retrieve result from re-reselect cached selector
      const actualResult = cachedSelector('foo', 1);

      // Retrieve result directly calling underlying reselect selector
      const reselectSelector = cachedSelector.getMatchingSelector('foo', 1);
      const expectedResultFromSelector = reselectSelector('foo', 1);

      expect(actualResult).toBe(expectedResultFromSelector);
    });

    it('Should return "undefined" when given cache key doesn\'t match any cache entry', () => {
      const cachedSelector = selectorWithMockedResultFunc();

      const actual = cachedSelector.getMatchingSelector('foo', 1);
      const expected = undefined;

      expect(actual).toEqual(expected);
    });
  });

  describe('removeMatchingSelector()', () => {
    it('Should set the matching cache entry to "undefined"', () => {
      const cachedSelector = selectorWithMockedResultFunc();

      cachedSelector('foo', 1); // add to cache
      cachedSelector('foo', 2); // add to cache
      cachedSelector.removeMatchingSelector('foo', 1); // remove key from chache

      const firstSelectorActual = cachedSelector.getMatchingSelector('foo', 1);
      const secondSelectorActual = cachedSelector.getMatchingSelector('foo', 2);

      expect(firstSelectorActual).toBe(undefined);
      expect(secondSelectorActual).not.toBe(undefined);
    });
  });

  describe('clearCache()', () => {
    it('Should reset cache', () => {
      const cachedSelector = selectorWithMockedResultFunc();

      cachedSelector('foo', 1); // add to cache
      cachedSelector.clearCache(); // clear cache
      const actual = cachedSelector.getMatchingSelector('foo', 1);

      expect(actual).toBe(undefined);
    });
  });

  describe('resultFunc', () => {
    it('Should point to provided result function', () => {
      const cachedSelector = createCachedSelector(() => {}, resultFunc)(
        (arg1, arg2) => arg2
      );
      expect(cachedSelector.resultFunc).toBe(resultFunc);
    });
  });
});
