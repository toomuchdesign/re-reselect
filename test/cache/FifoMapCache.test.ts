import { expectTypeOf } from 'expect-type';
import { describe, expect, it } from 'vitest';

import { FifoMapCache, createCachedSelector } from '../../src/index';
import testBasicBehavior from './test-utils/testBasicBehavior';
import testCacheSizeOptionValidation from './test-utils/testCacheSizeOptionValidation';
import testFifoBehavior from './test-utils/testFifoBehavior';
import testMapCacheKeyBehavior from './test-utils/testMapCacheKeyBehavior';

describe('FifoMapCache', () => {
  testBasicBehavior(() => new FifoMapCache({ cacheSize: 10 }));
  testFifoBehavior(FifoMapCache);
  testCacheSizeOptionValidation(FifoMapCache);
  testMapCacheKeyBehavior(() => new FifoMapCache({ cacheSize: 10 }));

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
      cacheObject: new FifoMapCache({ cacheSize: 10 }),
    });

    expect(() => {
      // @ts-expect-error
      new FifoMapCache({});
    }).toThrow('Missing the required property "cacheSize".');

    // Exposes the interface
    const cacheObject = new FifoMapCache({ cacheSize: 10 });
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
