import { expectTypeOf } from 'expect-type';
import { describe, expect, it } from 'vitest';

import { FifoObjectCache, createCachedSelector } from '../../src/index';
import testBasicBehavior from './test-utils/testBasicBehavior';
import testCacheSizeOptionValidation from './test-utils/testCacheSizeOptionValidation';
import testFifoBehavior from './test-utils/testFifoBehavior';
import testObjectCacheKeyBehavior from './test-utils/testObjectCacheKeyBehavior';

describe('FifoObjectCache', () => {
  testBasicBehavior(() => new FifoObjectCache({ cacheSize: 10 }));
  testFifoBehavior(FifoObjectCache);
  testCacheSizeOptionValidation(FifoObjectCache);
  testObjectCacheKeyBehavior(() => new FifoObjectCache({ cacheSize: 10 }));

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
      cacheObject: new FifoObjectCache({ cacheSize: 10 }),
    });

    expect(() => {
      // @ts-expect-error
      new FifoObjectCache();
    }).toThrow('Missing the required property "cacheSize".');

    // Exposes the interface
    const cacheObject = new FifoObjectCache({ cacheSize: 10 });
    cacheObject.set('foo', () => {});
    cacheObject.set(1, () => {});
    // @ts-expect-error
    cacheObject.set({}, () => {});

    expectTypeOf(cacheObject.get('foo')).toEqualTypeOf<any>();
    expectTypeOf(cacheObject.get(2)).toEqualTypeOf<any>();

    cacheObject.remove('foo');
    cacheObject.remove(1);
    cacheObject.clear();

    cacheObject.isValidCacheKey(1);
  });
});
