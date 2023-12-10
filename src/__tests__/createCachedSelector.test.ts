import * as reselect from 'reselect';
import {createCachedSelector, FlatObjectCache, ICacheObject} from '../index';

// Cannot natively spyOn es module named exports
jest.mock('reselect', () => ({
  __esModule: true,
  ...jest.requireActual('reselect'),
}));

const createSelectorSpy = jest.spyOn(reselect, 'createSelector');
const consoleWarnSpy = jest
  .spyOn(global.console, 'warn')
  .mockImplementation(() => {});

function selectorWithMockedResultFunc() {
  return createCachedSelector([(arg1: string, arg2: string) => null], () => {})(
    (arg1, arg2) => arg2 // keySelector
  );
}

describe('createCachedSelector', () => {
  describe('options', () => {
    describe('as single function', () => {
      it('accepts keySelector function', () => {
        const keySelectorMock = () => {};
        const cachedSelector = createCachedSelector(
          () => {},
          () => {}
        )(keySelectorMock);

        expect(cachedSelector.keySelector).toBe(keySelectorMock);
      });
    });

    describe('as single object', () => {
      it('accepts keySelector, cacheObject and selectorCreator options', () => {
        const cachedSelector = createCachedSelector(
          (arg1: string, arg2: string) => null,
          () => {}
        )({
          keySelector: (arg1, arg2) => arg2,
          cacheObject: new FlatObjectCache(),
          selectorCreator: reselect.createSelector,
        });

        expect(cachedSelector.recomputations()).toBe(0);
        cachedSelector('foo', 'bar');
        cachedSelector('foo', 'bar');
        expect(cachedSelector.recomputations()).toBe(1);
      });

      it('accepts keySelectorCreator option', () => {
        const inputSelector = () => {};
        const resultFunc = () => {};
        const keySelector = () => {};
        const generatedKeySelector = () => {};
        const keySelectorCreatorMock = jest.fn(() => generatedKeySelector);

        const cachedSelector = createCachedSelector(
          inputSelector,
          resultFunc
        )({
          keySelector,
          keySelectorCreator: keySelectorCreatorMock,
        });

        expect(keySelectorCreatorMock).toHaveBeenCalledWith({
          inputSelectors: [inputSelector],
          resultFunc: resultFunc,
          keySelector: keySelector,
        });
        expect(cachedSelector.keySelector).toBe(generatedKeySelector);
      });
    });
  });

  describe('created selector', () => {
    describe('cache retention', () => {
      describe('calls producing identical cacheKey', () => {
        it('creates and use the same cached selector', () => {
          const cachedSelector = selectorWithMockedResultFunc();
          cachedSelector('foo', 'bar');
          cachedSelector('foo', 'bar');

          expect(createSelectorSpy).toHaveBeenCalledTimes(1);
          expect(cachedSelector.recomputations()).toBe(1);
        });
      });

      describe('calls producing 2 different cacheKey', () => {
        it('creates 2 selectors only and produce 2 recomputations', () => {
          const cachedSelector = selectorWithMockedResultFunc();
          cachedSelector('foo', 'bar');
          cachedSelector('foo', 'moo');
          cachedSelector('foo', 'bar');
          cachedSelector('foo', 'moo');

          expect(createSelectorSpy).toHaveBeenCalledTimes(2);
          expect(cachedSelector.recomputations()).toBe(2);
        });
      });
    });

    describe('cacheKey validation', () => {
      describe('cacheObject.isValidCacheKey', () => {
        describe("doesn't exist", () => {
          it('accepts any value', () => {
            const cacheObjectMock: ICacheObject = {
              get: jest.fn(() => () => 'foo'),
              set: () => {},
              remove: () => {},
              clear: () => {},
            };
            const values = [{}, [], null, undefined, 12, 'bar'];

            const cachedSelector = createCachedSelector(
              () => {},
              () => {}
            )({
              keySelector: arg1 => arg1,
              cacheObject: cacheObjectMock,
            });

            values.forEach((value, index) => {
              cachedSelector(value);
              expect(cacheObjectMock.get).toHaveBeenCalledTimes(index + 1);
              expect(cacheObjectMock.get).toHaveBeenLastCalledWith(value);
            });
          });
        });

        describe('returns true', () => {
          it('calls cache.get method', () => {
            const cacheObjectMock = new FlatObjectCache();
            cacheObjectMock.isValidCacheKey = () => true;
            cacheObjectMock.get = jest.fn();

            const cachedSelector = createCachedSelector(
              () => {},
              () => {}
            )({
              keySelector: arg1 => arg1,
              cacheObject: cacheObjectMock,
            });

            cachedSelector('foo');

            expect(cacheObjectMock.get).toHaveBeenCalledTimes(1);
            expect(cacheObjectMock.get).toHaveBeenCalledWith('foo');
          });
        });

        describe('returns false', () => {
          it('returns "undefined" and call "console.warn"', () => {
            const cacheObjectMock = new FlatObjectCache();
            cacheObjectMock.isValidCacheKey = () => false;
            cacheObjectMock.get = jest.fn();

            const cachedSelector = createCachedSelector(
              () => {},
              () => {}
            )({
              keySelector: arg1 => arg1,
              cacheObject: cacheObjectMock,
            });

            const actual = cachedSelector('foo');

            expect(actual).toBe(undefined);
            expect(cacheObjectMock.get).not.toHaveBeenCalled();
            expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
          });
        });
      });
    });

    describe('available methods', () => {
      describe('getMatchingSelector()', () => {
        it('returns underlying reselect selector for a given cache key', () => {
          const cachedSelector = createCachedSelector(
            (arg1: string, arg2: number) => {},
            () => {}
          )((arg1, arg2) => arg2);

          // Retrieve result from re-reselect cached selector
          const actualResult = cachedSelector('foo', 1);

          // Retrieve result directly calling underlying reselect selector
          const reselectSelector = cachedSelector.getMatchingSelector('foo', 1);
          const expectedResultFromSelector = reselectSelector('foo', 1);

          expect(actualResult).toBe(expectedResultFromSelector);
        });

        it('returns "undefined" when given cache key doesn\'t match any cache entry', () => {
          const cachedSelector = selectorWithMockedResultFunc();

          const actual = cachedSelector.getMatchingSelector(
            'foo',
            'not-existing'
          );
          const expected = undefined;

          expect(actual).toEqual(expected);
        });
      });

      describe('removeMatchingSelector()', () => {
        it('sets the matching cache entry to "undefined"', () => {
          const cachedSelector = selectorWithMockedResultFunc();

          cachedSelector('foo', 'bar'); // add to cache
          cachedSelector('foo', 'moo'); // add to cache
          cachedSelector.removeMatchingSelector('foo', 'bar');

          const firstSelectorActual = cachedSelector.getMatchingSelector(
            'foo',
            'bar'
          );
          const secondSelectorActual = cachedSelector.getMatchingSelector(
            'foo',
            'moo'
          );

          expect(firstSelectorActual).toBe(undefined);
          expect(secondSelectorActual).not.toBe(undefined);
        });
      });

      describe('clearCache()', () => {
        it('resets cache', () => {
          const cachedSelector = selectorWithMockedResultFunc();

          cachedSelector('foo', 'bar'); // add to cache
          cachedSelector.clearCache();
          const actual = cachedSelector.getMatchingSelector('foo', 'bar');

          expect(actual).toBe(undefined);
        });
      });

      describe('resetRecomputations()', () => {
        it('resets recomputations', () => {
          const cachedSelector = selectorWithMockedResultFunc();
          cachedSelector('foo', 'bar');

          expect(cachedSelector.recomputations()).toBe(1);
          cachedSelector.resetRecomputations();
          expect(cachedSelector.recomputations()).toBe(0);
        });
      });

      describe('"dependencies" property', () => {
        it('exports an array containing provided inputSelectors', () => {
          type State = {a: string};
          const dependency1 = (state: State) => state.a;
          const dependency2 = (state: State) => state.a;

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
        it('points to provided result function', () => {
          const resultFunc = () => {};
          const cachedSelector = createCachedSelector(() => {}, resultFunc)(
            (arg1, arg2) => arg2
          );
          expect(cachedSelector.resultFunc).toBe(resultFunc);
        });
      });

      describe('"cache" property', () => {
        it('points to currently used cacheObject', () => {
          const currentCacheObject = new FlatObjectCache();
          const cachedSelector = createCachedSelector(
            () => {},
            () => {}
          )({
            keySelector: arg1 => arg1,
            cacheObject: currentCacheObject,
          });

          expect(cachedSelector.cache).toBe(currentCacheObject);
        });
      });

      describe('"keySelector" property', () => {
        it('points to provided keySelector', () => {
          const keySelector = () => {};
          const cachedSelector = createCachedSelector(
            () => {},
            () => {}
          )(keySelector);
          expect(cachedSelector.keySelector).toBe(keySelector);
        });
      });
    });
  });
});
