import { expectTypeOf } from 'expect-type';
import { describe, expect, it } from 'vitest';

import { LruMapCache, createCachedSelector } from '../../src/index';
import testBasicBehavior from './test-utils/testBasicBehavior';
import testCacheSizeOptionValidation from './test-utils/testCacheSizeOptionValidation';
import testLruBehavior from './test-utils/testLruBehavior';
import testMapCacheKeyBehavior from './test-utils/testMapCacheKeyBehavior';

describe('LruMapCache', () => {
  testBasicBehavior(() => new LruMapCache({ cacheSize: 10 }));
  testLruBehavior(LruMapCache);
  testCacheSizeOptionValidation(LruMapCache);
  testMapCacheKeyBehavior(() => new LruMapCache({ cacheSize: 10 }));

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
      cacheObject: new LruMapCache({ cacheSize: 10 }),
    });

    expect(() => {
      // @ts-expect-error
      new LruMapCache({});
    }).toThrow('Missing the required property "cacheSize".');

    // Exposes the interface
    const cacheObject = new LruMapCache({ cacheSize: 10 });
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
