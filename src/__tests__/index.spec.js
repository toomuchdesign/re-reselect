/* eslint comma-dangle: 0 */
import {createSelector} from 'reselect';
import createCachedSelector, {FlatObjectCache} from '../index';

let resultFunc;
let consoleWarnSpy;

beforeAll(() => {
  consoleWarnSpy = jest
    .spyOn(global.console, 'warn')
    .mockImplementation(() => {});
});

beforeEach(() => {
  resultFunc = jest.fn();
  consoleWarnSpy.mockReset();
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
    describe('cacheObject.isValidCacheKey not available', () => {
      it('Should accept any value', () => {
        const cacheObjectMock = {
          get: jest.fn(() => () => 'foo'),
        };
        const values = [{}, [], null, undefined, 12, 'bar'];

        const cachedSelector = createCachedSelector(resultFunc)(
          arg1 => arg1, // cacheKey
          {
            cacheObject: cacheObjectMock,
          }
        );

        values.forEach((value, index) => {
          cachedSelector(value);
          expect(cacheObjectMock.get).toHaveBeenCalledTimes(index + 1);
          expect(cacheObjectMock.get).toHaveBeenLastCalledWith(value);
        });
      });
    });

    describe('cacheObject.isValidCacheKey returns "true"', () => {
      it('Should call cache.get method', () => {
        const cacheObjectMock = new FlatObjectCache();
        cacheObjectMock.isValidCacheKey = jest.fn(() => true);
        cacheObjectMock.get = jest.fn();

        const cachedSelector = createCachedSelector(resultFunc)(arg1 => arg1, {
          cacheObject: cacheObjectMock,
        });

        cachedSelector('foo');

        expect(cacheObjectMock.get).toHaveBeenCalledTimes(1);
        // Receive cacheKey and reselect selector as arguments
        expect(cacheObjectMock.get).toHaveBeenCalledWith('foo');
      });
    });

    describe('cacheObject.isValidCacheKey returns "false"', () => {
      it('Should return "undefined" and call "console.warn"', () => {
        const cacheObjectMock = new FlatObjectCache();
        cacheObjectMock.isValidCacheKey = jest.fn(() => false);
        cacheObjectMock.get = jest.fn();

        const cachedSelector = createCachedSelector(resultFunc)(arg1 => arg1, {
          cacheObject: cacheObjectMock,
        });

        const actual = cachedSelector('foo');

        expect(actual).toBe(undefined);
        expect(cacheObjectMock.get).not.toHaveBeenCalled();
        expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
      });
    });
  });

  it('Should throw an error when a function is provided as 2° argument', () => {
    expect(() => {
      const cachedSelector = createCachedSelector(resultFunc)(() => {},
      createSelector);
    }).toThrow(/Second argument "options" must be an object/);
  });

  it('Should accept an options object', () => {
    const cachedSelector = createCachedSelector(resultFunc)(
      (arg1, arg2) => arg2,
      {
        cacheObject: new FlatObjectCache(),
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
