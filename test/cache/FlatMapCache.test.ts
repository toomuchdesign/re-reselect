import { expectTypeOf } from 'expect-type';
import { describe, it } from 'vitest';

import { FlatMapCache, createCachedSelector } from '../../src/index';
import testBasicBehavior from './test-utils/testBasicBehavior';
import testMapCacheKeyBehavior from './test-utils/testMapCacheKeyBehavior';

describe('FlatMapCache', () => {
  testBasicBehavior(() => new FlatMapCache());
  testMapCacheKeyBehavior(() => new FlatMapCache());

  it('exposes expected types', () => {
    type State = { foo: string };
    const fooSelector = (state: State) => state.foo;
    const combinerSelector = (foo: string) => foo;

    // Accepts this cache object as an option
    createCachedSelector(
      fooSelector,
      combinerSelector,
    )({
      keySelector: fooSelector,
      cacheObject: new FlatMapCache(),
    });

    // Exposes the interface
    const cacheObject = new FlatMapCache();
    cacheObject.set('foo', () => {});
    cacheObject.set(1, () => {});
    cacheObject.set({}, () => {});

    expectTypeOf(cacheObject.get('foo')).toEqualTypeOf<any>();
    expectTypeOf(cacheObject.get(2)).toEqualTypeOf<any>();
    expectTypeOf(cacheObject.get({})).toEqualTypeOf<any>();

    cacheObject.remove('foo');
    cacheObject.remove(1);
    cacheObject.remove({});
    cacheObject.clear();
  });
});
