import * as reselect from '../src/reselectWrapper';
import {
  createCachedSelector,
  FlatObjectCache,
  ICacheObject,
} from '../src/index';
import type {CreateSelectorOptions} from 'reselect';
import {describe, expect, it, vi, beforeEach} from 'vitest';

beforeEach(() => {
  vi.spyOn(reselect, 'createSelector');
  vi.spyOn(global.console, 'warn').mockImplementation(() => {});
});

describe('createCachedSelector', () => {
  describe('created selector', () => {
    describe('cache retention', () => {
      describe('calls producing identical cacheKey', () => {
        it('creates and use the same cached selector', () => {
          const cachedSelector = createCachedSelector(
            [(state: string, param1: string) => null],
            () => {}
          )({keySelector: (state, param1) => param1});
          cachedSelector('foo', 'bar');
          cachedSelector('foo', 'bar');

          expect(reselect.createSelector).toHaveBeenCalledTimes(1);
          expect(cachedSelector.recomputations()).toBe(1);
        });
      });

      describe('calls producing 2 different cacheKey', () => {
        it('creates 2 selectors only and produce 2 recomputations', () => {
          const cachedSelector = createCachedSelector(
            [(state: string, param1: string) => null],
            () => {}
          )({keySelector: (state, param1) => param1});
          cachedSelector('foo', 'bar');
          cachedSelector('foo', 'moo');
          cachedSelector('foo', 'bar');
          cachedSelector('foo', 'moo');

          expect(reselect.createSelector).toHaveBeenCalledTimes(2);
          expect(cachedSelector.recomputations()).toBe(2);
        });
      });
    });

    describe('cacheKey validation', () => {
      describe('cacheObject.isValidCacheKey', () => {
        describe("doesn't exist", () => {
          it('accepts any value', () => {
            const cacheObjectMock: ICacheObject = {
              get: vi.fn(() => () => 'foo'),
              set: () => {},
              remove: () => {},
              clear: () => {},
            };
            const values = [{}, [], null, undefined, 12, 'bar'];

            const cachedSelector = createCachedSelector(
              () => {},
              () => {}
            )({
              keySelector: state => state,
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
            cacheObjectMock.get = vi.fn();

            const cachedSelector = createCachedSelector(
              () => {},
              () => {}
            )({
              keySelector: state => state,
              cacheObject: cacheObjectMock,
            });

            cachedSelector('foo');

            expect(cacheObjectMock.get).toHaveBeenCalledTimes(1);
            expect(cacheObjectMock.get).toHaveBeenCalledWith('foo');
          });
        });

        describe('returns false', () => {
          it('returns "undefined" and calls "console.warn"', () => {
            const cacheObjectMock = new FlatObjectCache();
            cacheObjectMock.isValidCacheKey = () => false;
            cacheObjectMock.get = vi.fn();

            const cachedSelector = createCachedSelector(
              () => {},
              () => {}
            )({
              keySelector: state => state,
              cacheObject: cacheObjectMock,
            });

            const actual = cachedSelector('foo');

            expect(actual).toBe(undefined);
            expect(cacheObjectMock.get).not.toHaveBeenCalled();
            expect(console.warn).toHaveBeenCalledTimes(1);
          });
        });
      });
    });

    describe('available methods', () => {
      describe('getMatchingSelector()', () => {
        it('returns underlying reselect selector for a given cache key', () => {
          const cachedSelector = createCachedSelector(
            (state: string, param1: number) => {},
            () => {}
          )((state, param1) => param1);

          // Retrieve result from re-reselect cached selector
          const actualResult = cachedSelector('foo', 1);

          // Retrieve result directly calling underlying reselect selector
          const reselectSelector = cachedSelector.getMatchingSelector('foo', 1);
          const expectedResultFromSelector = reselectSelector('foo', 1);

          expect(actualResult).toBe(expectedResultFromSelector);
        });

        it('returns "undefined" when given cache key doesn\'t match any cache entry', () => {
          const cachedSelector = createCachedSelector(
            [(state: string, param1: string) => null],
            () => {}
          )({keySelector: (state, param1) => param1});

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
          const cachedSelector = createCachedSelector(
            [(state: string, param1: string) => null],
            () => {}
          )({keySelector: (state, param1) => param1});

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
          const cachedSelector = createCachedSelector(
            [(state: string, param1: string) => null],
            () => {}
          )({keySelector: (state, param1) => param1});

          cachedSelector('foo', 'bar'); // add to cache
          cachedSelector.clearCache();
          const actual = cachedSelector.getMatchingSelector('foo', 'bar');

          expect(actual).toBe(undefined);
        });
      });

      describe('resetRecomputations()', () => {
        it('resets recomputations', () => {
          const cachedSelector = createCachedSelector(
            [(state: string, param1: string) => null],
            () => {}
          )({keySelector: (state, param1) => param1});
          cachedSelector('foo', 'bar');

          expect(cachedSelector.recomputations()).toBe(1);
          cachedSelector.resetRecomputations();
          expect(cachedSelector.recomputations()).toBe(0);
        });
      });

      describe('"dependencies" property', () => {
        it('exports an array containing provided inputSelectors', () => {
          type State = {a: string};
          const inputSelector1 = (state: State) => state.a;
          const inputSelector2 = (state: State) => state.a;

          const cachedSelector = createCachedSelector(
            inputSelector1,
            inputSelector2,
            () => {}
          )(state => state);

          const actual = cachedSelector.dependencies;
          const expected = [inputSelector1, inputSelector2];
          expect(actual).toEqual(expected);
        });
      });

      describe('"resultFunc" property', () => {
        it('points to provided result function', () => {
          const resultFunc = () => {};
          const cachedSelector = createCachedSelector(() => {}, resultFunc)({
            keySelector: (state, param1) => param1,
          });
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
            keySelector: state => state,
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
          (state: string, param1: string) => null,
          () => {}
        )({
          keySelector: (state, param1) => param1,
          cacheObject: new FlatObjectCache(),
          selectorCreator: reselect.createSelector,
        });

        expect(cachedSelector.recomputations()).toBe(0);
        cachedSelector('foo', 'bar');
        cachedSelector('foo', 'bar');
        expect(cachedSelector.recomputations()).toBe(1);
      });

      describe('"keySelectorCreator" option', () => {
        it('overrides "keySelector" with provided function result', () => {
          const inputSelector = () => {};
          const resultFunc = () => {};
          const keySelector = () => {};
          const generatedKeySelector = () => {};
          const keySelectorCreatorMock = vi.fn(() => generatedKeySelector);

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
  });

  it("accepts and forwards reselect's createSelectorOptions object", () => {
    const inputSelector1 = (state: string, param1: string) => null;
    const createSelectorOptions: CreateSelectorOptions = {
      memoizeOptions: {resultEqualityCheck: () => true},
    };

    const cachedSelector = createCachedSelector(
      [inputSelector1],
      () => {},
      createSelectorOptions
    )({keySelector: (state, param1) => param1});

    cachedSelector('foo', 'bar');
    cachedSelector('foo', 'bar');

    expect(reselect.createSelector).toHaveBeenCalledTimes(1);
    expect(reselect.createSelector).toHaveBeenCalledWith(
      [inputSelector1],
      expect.any(Function),
      createSelectorOptions
    );

    expect(cachedSelector.recomputations()).toBe(1);
  });
});
