import { expectTypeOf } from 'expect-type';
import { describe, expect, it } from 'vitest';

import { LruObjectCache, createCachedSelector } from '../../src/index';
import testBasicBehavior from './test-utils/testBasicBehavior';
import testCacheSizeOptionValidation from './test-utils/testCacheSizeOptionValidation';
import testLruBehavior from './test-utils/testLruBehavior';
import testObjectCacheKeyBehavior from './test-utils/testObjectCacheKeyBehavior';

describe('LruObjectCache', () => {
  testBasicBehavior(() => new LruObjectCache({ cacheSize: 10 }));
  testLruBehavior(LruObjectCache);
  testCacheSizeOptionValidation(LruObjectCache);
  testObjectCacheKeyBehavior(() => new LruObjectCache({ cacheSize: 10 }));

  describe.each([
    [1, '1'],
    ['1', 1],
  ])('equivalent object keys %s and %s', (first, alias) => {
    it('updates an existing entry without evicting it', () => {
      const cache = new LruObjectCache({ cacheSize: 2 });
      cache.set(first, 'old');
      cache.set(alias, 'updated');
      cache.set('other', 'other');

      expect(cache.get(first)).toBe('updated');
      expect(cache.get('other')).toBe('other');
    });

    it('updates recency when an entry is read through its alias', () => {
      const cache = new LruObjectCache({ cacheSize: 2 });
      cache.set(first, 'one');
      cache.set('other', 'other');
      expect(cache.get(alias)).toBe('one');
      cache.set('new', 'new');

      expect(cache.get(first)).toBe('one');
      expect(cache.get('other')).toBeUndefined();
      expect(cache.get('new')).toBe('new');
    });

    it('removes the ordering entry when removed through its alias', () => {
      const cache = new LruObjectCache({ cacheSize: 2 });
      cache.set(first, 'one');
      cache.set('other', 'other');
      cache.remove(alias);
      cache.set(alias, 'replacement');

      expect(cache.get(first)).toBe('replacement');
      expect(cache.get('other')).toBe('other');
    });
  });

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
      cacheObject: new LruObjectCache({ cacheSize: 10 }),
    });

    expect(() => {
      // @ts-expect-error
      new LruObjectCache({});
    }).toThrow('Missing the required property "cacheSize".');

    // Exposes the interface
    const cacheObject = new LruObjectCache({ cacheSize: 10 });
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
