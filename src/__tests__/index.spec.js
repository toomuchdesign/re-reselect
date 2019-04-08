/* eslint comma-dangle: 0 */
import * as reselect from 'reselect';
import createCachedSelector, {
  createKeyComposedSelector,
  FlatObjectCache,
  FlatMapCache,
} from '../../src/index';

const createSelectorSpy = jest.spyOn(reselect, 'createSelector');
const consoleWarnSpy = jest
  .spyOn(global.console, 'warn')
  .mockImplementation(() => {});
const resultFuncMock = () => undefined;

beforeEach(() => {
  consoleWarnSpy.mockClear();
  createSelectorSpy.mockClear();
});

function selectorWithMockedResultFunc() {
  return createCachedSelector([], resultFuncMock)(
    (arg1, arg2) => arg2 // keySelector
  );
}

describe('createCachedSelector', () => {
  describe('"recomputations" property and cached selectors', () => {
    describe('keySelector returns the same value', () => {
      it('Should create and use the same cached selector', () => {
        const cachedSelector = selectorWithMockedResultFunc();
        const firstCall = cachedSelector('foo', 'bar');
        const secondCallWithSamekeySelector = cachedSelector('foo', 'bar');

        expect(createSelectorSpy).toHaveBeenCalledTimes(1);
        expect(cachedSelector.recomputations()).toBe(1);
      });
    });

    describe('keySelector returns 2 different values', () => {
      it('Should create 2 selectors only and produce 2 recomputations', () => {
        const cachedSelector = selectorWithMockedResultFunc();
        const firstCallResult = cachedSelector('foo', 'bar');
        const secondCallResult = cachedSelector('foo', 'moo');
        const thirdCallResult = cachedSelector('foo', 'bar');
        const fourthCallResult = cachedSelector('foo', 'moo');

        expect(createSelectorSpy).toHaveBeenCalledTimes(2);
        expect(cachedSelector.recomputations()).toBe(2);
      });
    });

    describe('keySelector missing', () => {
      it('Should work without key selector as simple reselect selector', () => {
        const cachedSelector = createCachedSelector(
          state => state,
          resultFuncMock
        )();
        const firstCallResult = cachedSelector('foo');
        const secondCallResult = cachedSelector('foo');
        const thirdCallResult = cachedSelector('bar');
        const fourthCallResult = cachedSelector('bar');

        expect(createSelectorSpy).toHaveBeenCalledTimes(1);
        expect(cachedSelector.recomputations()).toBe(2);
      });
    });
  });

  describe('cacheKey validity check', () => {
    describe('cacheObject.isValidCacheKey not available', () => {
      it('Should accept any value', () => {
        const cacheObjectMock = {
          get: jest.fn(() => () => 'foo'),
        };
        const values = [{}, [], null, undefined, 12, 'bar'];

        const cachedSelector = createCachedSelector(resultFuncMock)(
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

        const cachedSelector = createCachedSelector(resultFuncMock)(
          arg1 => arg1,
          {
            cacheObject: cacheObjectMock,
          }
        );

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

        const cachedSelector = createCachedSelector(resultFuncMock)(
          arg1 => arg1,
          {
            cacheObject: cacheObjectMock,
          }
        );

        const actual = cachedSelector('foo');

        expect(actual).toBe(undefined);
        expect(cacheObjectMock.get).not.toHaveBeenCalled();
        expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
      });
    });
  });

  it('Should throw an error when a function is provided as 2° argument', () => {
    expect(() => {
      const cachedSelector = createCachedSelector(resultFuncMock)(() => {},
      reselect.createSelector);
    }).toThrow(/Second argument "options" must be an object/);
  });

  it('Should accept an options object', () => {
    const cachedSelector = createCachedSelector(resultFuncMock)(
      (arg1, arg2) => arg2,
      {
        cacheObject: new FlatObjectCache(),
        selectorCreator: reselect.createSelector,
      }
    );

    expect(cachedSelector.recomputations()).toBe(0);
    cachedSelector('foo', 'bar');
    cachedSelector('foo', 'bar');
    expect(cachedSelector.recomputations()).toBe(1);
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

  describe('resetRecomputations()', () => {
    it('Should reset recomputations', () => {
      const cachedSelector = selectorWithMockedResultFunc();
      const firstCallResult = cachedSelector('foo', 'bar');

      expect(cachedSelector.recomputations()).toBe(1);
      cachedSelector.resetRecomputations();
      expect(cachedSelector.recomputations()).toBe(0);
    });
  });

  describe('"dependencies" property', () => {
    it('Should export an array containing provided inputSelectors', () => {
      const dependency1 = state => state.a;
      const dependency2 = state => state.a;

      const cachedSelector = createCachedSelector(
        dependency1,
        dependency2,
        () => {}
      )(arg1 => arg1);

      const actual = cachedSelector.dependencies;
      const expected = [dependency1, dependency2];
      expect(actual).toEqual(expected);
    });
  });

  describe('"resultFunc" property', () => {
    it('Should point to provided result function', () => {
      const cachedSelector = createCachedSelector(() => {}, resultFuncMock)(
        (arg1, arg2) => arg2
      );
      expect(cachedSelector.resultFunc).toBe(resultFuncMock);
    });
  });

  describe('"cache" property', () => {
    it('Should point to currently used cacheObject', () => {
      const currentCacheObject = new FlatObjectCache();
      const cachedSelector = createCachedSelector(resultFuncMock)(
        arg1 => arg1,
        {
          cacheObject: currentCacheObject,
        }
      );

      expect(cachedSelector.cache).toBe(currentCacheObject);
    });
  });

  describe('"keySelector" property', () => {
    it('Should point to provided keySelector', () => {
      const keySelector = (arg1, arg2) => arg2;
      const cachedSelector = createCachedSelector(() => {}, resultFuncMock)(
        keySelector
      );
      expect(cachedSelector.keySelector).toBe(keySelector);
    });
  });
});

describe('createKeyComposedSelector', () => {
  describe('composition of key selectors', () => {
    const state = {
      [1]: 'first item',
      [2]: 'second item',
    };

    const dependency1 = createCachedSelector(
      state => state,
      (state, props) => props.id,
      (state, id) => state[id]
    )((state, props) => props.id);

    const dependency2 = createCachedSelector(
      state => state,
      (state, props) => props.otherId,
      (state, id) => state[id]
    )((state, props) => props.otherId);

    it('Should cache result without key selector by composition of input key selectors', () => {
      const keyComposedSelector = createKeyComposedSelector(
        dependency1,
        dependency2,
        resultFuncMock
      )();

      keyComposedSelector(state, {
        id: 1,
        otherId: 2,
      });
      keyComposedSelector(state, {
        id: 2,
        otherId: 1,
      });
      keyComposedSelector(state, {
        id: 1,
        otherId: 2,
      });
      keyComposedSelector(state, {
        id: 2,
        otherId: 1,
      });

      expect(keyComposedSelector.recomputations()).toBe(2);
    });

    it('Should be tolerant to non re-reselect dependencies', () => {
      const keyComposedSelector = createKeyComposedSelector(
        () => 123,
        dependency1,
        dependency2,
        resultFuncMock
      )();

      keyComposedSelector(state, {
        id: 1,
        otherId: 2,
      });
      keyComposedSelector(state, {
        id: 2,
        otherId: 1,
      });
      keyComposedSelector(state, {
        id: 1,
        otherId: 2,
      });
      keyComposedSelector(state, {
        id: 2,
        otherId: 1,
      });

      expect(keyComposedSelector.recomputations()).toBe(2);
    });

    it('Should not try compose key selectors if some key selector returns object', () => {
      const keyComposedSelector = createKeyComposedSelector(
        dependency1,
        dependency2,
        resultFuncMock
      )(undefined, {
        cacheObject: new FlatMapCache(),
      });

      const key = {};

      keyComposedSelector(state, {
        id: 1,
        otherId: key,
      });
      keyComposedSelector(state, {
        id: key,
        otherId: 1,
      });
      keyComposedSelector(state, {
        id: 1,
        otherId: key,
      });
      keyComposedSelector(state, {
        id: key,
        otherId: 1,
      });

      expect(keyComposedSelector.recomputations()).toBe(4);
    });

    it('Should support "keySeparator" option for custom key separator', () => {
      const keyComposedSelector = createKeyComposedSelector(
        dependency1,
        dependency2,
        resultFuncMock
      )(undefined, {
        keySeparator: '|',
      });

      const key = keyComposedSelector.keySelector(state, {
        id: 1,
        otherId: 2,
      });

      expect(key).toBe('|1|2');
    });

    it('Should be possible provide additional key selector', () => {
      const keyComposedSelector = createKeyComposedSelector(
        [dependency1, dependency2, (state, props) => props.additionalId],
        resultFuncMock
      )((state, props) => props.additionalId);

      const key = keyComposedSelector.keySelector(state, {
        id: 1,
        otherId: 2,
        additionalId: 666,
      });

      expect(key).toBe('666:1:2');
    });
  });
});
