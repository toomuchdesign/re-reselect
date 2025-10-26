import { expectTypeOf } from 'expect-type';
import {
  type CreateSelectorOptions,
  createSelectorCreator,
  lruMemoize,
  weakMapMemoize,
} from 'reselect';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  FlatObjectCache,
  type ICacheObject,
  type KeySelector,
  createCachedSelector,
} from '../src/index';
import * as reselect from '../src/reselectWrapper';

beforeEach(() => {
  vi.spyOn(reselect, 'createSelector');
  vi.spyOn(global.console, 'warn').mockImplementation(() => {});
});

describe('createCachedSelector', () => {
  describe('selector', () => {
    describe('input selectors as array', () => {
      it('returns expected values', () => {
        type State = {
          todos: { id: number; completed: boolean; user: string }[];
        };

        const state: State = {
          todos: [
            { id: 0, completed: false, user: 'max' },
            { id: 1, completed: true, user: 'max' },
            { id: 2, completed: false, user: 'tom' },
            { id: 3, completed: true, user: 'tom' },
          ],
        };

        const selector = createCachedSelector(
          [(state: State) => state.todos, (state: State, user: string) => user],
          (todos, user) => {
            return todos
              .filter((todo) => todo.completed === true)
              .filter((todo) => todo.user === user);
          },
        )({
          keySelector: (state, user) => {
            expectTypeOf(state).toEqualTypeOf<State>();
            expectTypeOf(user).toEqualTypeOf<string>();

            return user;
          },
        });

        expectTypeOf(selector).parameters.toEqualTypeOf<
          [State, string, ...args: any[]]
        >();

        // Selector return expectations
        {
          const actual = selector(state, 'max');
          expect(actual).toEqual([{ id: 1, completed: true, user: 'max' }]);
          expectTypeOf(actual).toEqualTypeOf<State['todos']>;
        }

        {
          const actual = selector(state, 'tom');
          expect(actual).toEqual([{ id: 3, completed: true, user: 'tom' }]);
          expectTypeOf(actual).toEqualTypeOf<State['todos']>;
        }

        {
          const actual = selector(state, 'max');
          expect(actual).toEqual([{ id: 1, completed: true, user: 'max' }]);
        }

        {
          const actual = selector(state, 'tom');
          expect(actual).toEqual([{ id: 3, completed: true, user: 'tom' }]);
        }

        expect(reselect.createSelector).toHaveBeenCalledTimes(2);
        expect(selector.recomputations()).toBe(2);
      });
    });

    describe('input selector as arguments (parametric)', () => {
      it('returns expected values', () => {
        type State = {
          todos: { id: number; completed: boolean; user: string }[];
        };

        const state: State = {
          todos: [
            { id: 0, completed: false, user: 'max' },
            { id: 1, completed: true, user: 'max' },
            { id: 2, completed: false, user: 'tom' },
            { id: 3, completed: true, user: 'tom' },
          ],
        };

        const selector = createCachedSelector(
          (state: State) => state.todos,
          (state: State, user: string) => user,
          (todos, user) => {
            return todos
              .filter((todo) => todo.completed === true)
              .filter((todo) => todo.user === user);
          },
        )({
          keySelector: (state, user) => {
            expectTypeOf(state).toEqualTypeOf<State>();
            expectTypeOf(user).toEqualTypeOf<string>();

            return user;
          },
        });

        expectTypeOf(selector).parameters.toEqualTypeOf<
          [State, string, ...args: any[]]
        >();

        // Selector return expectations
        {
          const actual = selector(state, 'max');
          expect(actual).toEqual([{ id: 1, completed: true, user: 'max' }]);
          expectTypeOf(actual).toEqualTypeOf<State['todos']>;
        }

        {
          const actual = selector(state, 'tom');
          expect(actual).toEqual([{ id: 3, completed: true, user: 'tom' }]);
          expectTypeOf(actual).toEqualTypeOf<State['todos']>;
        }

        {
          const actual = selector(state, 'max');
          expect(actual).toEqual([{ id: 1, completed: true, user: 'max' }]);
        }

        {
          const actual = selector(state, 'tom');
          expect(actual).toEqual([{ id: 3, completed: true, user: 'tom' }]);
        }

        expect(reselect.createSelector).toHaveBeenCalledTimes(2);
        expect(selector.recomputations()).toBe(2);
      });
    });

    describe('cache retention', () => {
      describe('calls producing identical cacheKey', () => {
        it('creates and use the same cached selector', () => {
          const cachedSelector = createCachedSelector(
            [(state: string, param1: string) => null],
            () => 'result',
          )({ keySelector: (state, param1) => param1 });
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
            () => {},
          )({ keySelector: (state, param1) => param1 });
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
              () => {},
            )({
              keySelector: (state) => state,
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
              () => {},
            )({
              keySelector: (state) => state,
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
              () => {},
            )({
              keySelector: (state) => state,
              cacheObject: cacheObjectMock,
            });

            const actual = cachedSelector('foo');

            expect(actual).toBe(undefined);
            expect(cacheObjectMock.get).not.toHaveBeenCalled();
            expect(console.warn).toHaveBeenCalledTimes(1);
            expect(console.warn).toHaveBeenCalledWith(
              '[re-reselect] Invalid cache key "foo" has been returned by keySelector function.',
            );
          });
        });
      });
    });

    describe('selector methods', () => {
      describe('getMatchingSelector()', () => {
        it('returns underlying reselect selector for a given cache key', () => {
          const cachedSelector = createCachedSelector(
            (state: string, param1: number) => {},
            () => {},
          )((state, param1) => param1);

          // Retrieve result from re-reselect cached selector
          const actualResult = cachedSelector('foo', 1);

          // Retrieve result directly calling underlying reselect selector
          const reselectSelector = cachedSelector.getMatchingSelector('foo', 1);
          const expectedResultFromSelector = reselectSelector('foo', 1);

          expect(actualResult).toBe(expectedResultFromSelector);

          // @ts-expect-error type check error when unexpected inputs provided
          cachedSelector.getMatchingSelector('foo', 'string');
        });

        it('returns "undefined" when given cache key doesn\'t match any cache entry', () => {
          const cachedSelector = createCachedSelector(
            [(state: string, param1: string) => null],
            () => {},
          )({ keySelector: (state, param1) => param1 });

          const actual = cachedSelector.getMatchingSelector(
            'foo',
            'not-existing',
          );
          const expected = undefined;

          expect(actual).toEqual(expected);
        });
      });

      describe('removeMatchingSelector()', () => {
        it('sets the matching cache entry to "undefined"', () => {
          const cachedSelector = createCachedSelector(
            [(state: string, param1: string) => null],
            () => {},
          )({ keySelector: (state, param1) => param1 });

          cachedSelector('foo', 'bar'); // add to cache
          cachedSelector('foo', 'moo'); // add to cache
          cachedSelector.removeMatchingSelector('foo', 'bar');

          const firstSelectorActual = cachedSelector.getMatchingSelector(
            'foo',
            'bar',
          );
          const secondSelectorActual = cachedSelector.getMatchingSelector(
            'foo',
            'moo',
          );

          expect(firstSelectorActual).toBe(undefined);
          expect(secondSelectorActual).not.toBe(undefined);

          // @ts-expect-error type check error when unexpected inputs provided
          cachedSelector.removeMatchingSelector('foo', 123);
        });
      });

      describe('clearCache()', () => {
        it('resets cache', () => {
          const cachedSelector = createCachedSelector(
            [(state: string, param1: string) => null],
            () => {},
          )({ keySelector: (state, param1) => param1 });

          cachedSelector('foo', 'bar'); // add to cache
          cachedSelector.clearCache();
          const actual = cachedSelector.getMatchingSelector('foo', 'bar');

          expect(actual).toBe(undefined);
        });
      });

      describe('recomputations() & resetRecomputations()', () => {
        it('resets recomputations', () => {
          const cachedSelector = createCachedSelector(
            [(state: string, param1: string) => null],
            () => {},
          )({ keySelector: (state, param1) => param1 });
          cachedSelector('foo', 'bar');

          expect(cachedSelector.recomputations()).toBe(1);
          cachedSelector.resetRecomputations();
          expect(cachedSelector.recomputations()).toBe(0);

          expectTypeOf(cachedSelector.recomputations()).toBeNumber();
          expectTypeOf(cachedSelector.resetRecomputations()).toBeNumber();
        });
      });

      describe('"dependencies" property', () => {
        it('exports an array containing provided inputSelectors', () => {
          type State = { a: string };
          const inputSelector1 = (state: State) => state.a;
          const inputSelector2 = (state: State) => state.a;

          const cachedSelector = createCachedSelector(
            inputSelector1,
            inputSelector2,
            () => {},
          )((state) => state);

          const actual = cachedSelector.dependencies;
          const expected = [inputSelector1, inputSelector2];
          expect(actual).toEqual(expected);

          const _dependencies: [
            (state: State) => string,
            (state: State) => string,
          ] = cachedSelector.dependencies;
        });
      });

      describe('"resultFunc" property', () => {
        it('points to provided result function', () => {
          type State = { a: string };
          const resultFunc = (a: string) => 'result';
          const cachedSelector = createCachedSelector(
            (state: State) => state.a,
            resultFunc,
          )({
            keySelector: (state, param1) => param1,
          });

          expect(cachedSelector.resultFunc).toBe(resultFunc);
          expectTypeOf(cachedSelector.resultFunc).toEqualTypeOf(resultFunc);
        });
      });

      describe('"cache" property', () => {
        it('points to currently used cacheObject', () => {
          const currentCacheObject = new FlatObjectCache();
          const cachedSelector = createCachedSelector(
            () => {},
            () => {},
          )({
            keySelector: (state) => state,
            cacheObject: currentCacheObject,
          });

          expect(cachedSelector.cache).toBe(currentCacheObject);
        });
      });

      describe('"keySelector" property', () => {
        it('points to provided keySelector', () => {
          type State = { a: string };
          const keySelector = (state: State) => 'key';
          const cachedSelector = createCachedSelector(
            (state: State) => {},
            () => {},
          )(keySelector);

          expect(cachedSelector.keySelector).toBe(keySelector);
          expectTypeOf(cachedSelector.keySelector).toEqualTypeOf<
            KeySelector<State>
          >();
        });
      });
    });
  });

  describe('options', () => {
    describe('as function', () => {
      it('accepts keySelector function', () => {
        const keySelectorMock = () => {};
        const cachedSelector = createCachedSelector(
          () => {},
          () => {},
        )(keySelectorMock);

        expect(cachedSelector.keySelector).toBe(keySelectorMock);
      });
    });

    describe('as object', () => {
      it('accepts keySelector, cacheObject and selectorCreator options', () => {
        const cachedSelector = createCachedSelector(
          (state: string, param1: string) => null,
          () => {},
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

      describe('"selectorCreator" option', () => {
        it("accepts reselect's createSelectorCreator", () => {
          type State = { foo: string };

          expect(() =>
            createCachedSelector(
              (state: State) => state.foo,
              (foo) => foo,
            )({
              keySelector: (state: State) => state.foo,
              selectorCreator: createSelectorCreator(lruMemoize),
            }),
          ).not.toThrow();

          expect(() =>
            createCachedSelector(
              (state: State) => state.foo,
              (foo) => foo,
            )({
              keySelector: (state: State) => state.foo,
              selectorCreator: createSelectorCreator({
                memoize: weakMapMemoize,
              }),
            }),
          ).not.toThrow();
        });
      });

      describe('"keySelectorCreator" option', () => {
        it('overrides "keySelector" with provided function result', () => {
          type State = { foo: string };
          const state: State = { foo: 'bar' };
          const inputSelector = (state: State) => state.foo;
          const resultFunc = (input: string) => input;
          const keySelector = (state: State) => state.foo;
          const generatedKeySelector = (state: State) => state.foo;
          const keySelectorCreatorMock = vi.fn();

          const cachedSelector = createCachedSelector(
            inputSelector,
            inputSelector,
            resultFunc,
          )({
            keySelector,
            keySelectorCreator: (args) => {
              const { inputSelectors, resultFunc, keySelector } = args;
              expectTypeOf(inputSelectors).toEqualTypeOf<
                [typeof inputSelector, typeof inputSelector]
              >();
              expectTypeOf(resultFunc).toEqualTypeOf(resultFunc);
              expectTypeOf(keySelector).toEqualTypeOf(keySelector);

              keySelectorCreatorMock(args);
              return generatedKeySelector;
            },
          });

          expect(keySelectorCreatorMock).toHaveBeenCalledWith({
            inputSelectors: [inputSelector, inputSelector],
            resultFunc: resultFunc,
            keySelector: keySelector,
          });

          expect(cachedSelector.keySelector).toBe(generatedKeySelector);

          const result = cachedSelector(state);
          expect(result).toEqual('bar');
          expectTypeOf(result).toBeString();
        });
      });
    });
  });

  it("accepts and forwards reselect's createSelectorOptions object", () => {
    const inputSelector1 = (state: string, param1: string) => null;
    const createSelectorOptions: CreateSelectorOptions = {
      memoizeOptions: { resultEqualityCheck: () => true },
    };

    const cachedSelector = createCachedSelector(
      [inputSelector1],
      () => {},
      createSelectorOptions,
    )({ keySelector: (state, param1) => param1 });

    cachedSelector('foo', 'bar');
    cachedSelector('foo', 'bar');

    expect(reselect.createSelector).toHaveBeenCalledTimes(1);
    expect(reselect.createSelector).toHaveBeenCalledWith(
      [inputSelector1],
      expect.any(Function),
      createSelectorOptions,
    );

    expect(cachedSelector.recomputations()).toBe(1);
  });
});
