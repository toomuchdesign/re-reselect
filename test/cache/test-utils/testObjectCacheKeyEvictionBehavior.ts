import { describe, expect, it } from 'vitest';

import type { ICacheObject } from '../../../src';

function testObjectCacheKeyEvictionBehavior(
  CacheObject: new (options: { cacheSize: number }) => ICacheObject,
) {
  describe.each([
    [1, '1'],
    ['1', 1],
    [NaN, 'NaN'],
    ['NaN', NaN],
    [NaN, NaN],
  ])('equivalent object keys %s and %s', (first, alias) => {
    it('updates an existing entry without evicting it', () => {
      const cache = new CacheObject({ cacheSize: 2 });
      cache.set(first, 'old');
      cache.set(alias, 'updated');
      cache.set('other', 'other');

      expect(cache.get(first)).toBe('updated');
      expect(cache.get('other')).toBe('other');
    });

    it('removes the ordering entry when removed through its alias', () => {
      const cache = new CacheObject({ cacheSize: 2 });
      cache.set(first, 'one');
      cache.set('other', 'other');
      cache.remove(alias);
      cache.set(alias, 'replacement');

      expect(cache.get(first)).toBe('replacement');
      expect(cache.get('other')).toBe('other');
    });
  });

  it('evicts entries correctly after a NaN key', () => {
    const cache = new CacheObject({ cacheSize: 2 });
    cache.set(NaN, 'nan');
    cache.set('x', 'x');
    cache.set('y', 'y');
    cache.set('z', 'z');

    expect(cache.get(NaN)).toBeUndefined();
    expect(cache.get('x')).toBeUndefined();
    expect(cache.get('y')).toBe('y');
    expect(cache.get('z')).toBe('z');
  });
}

export default testObjectCacheKeyEvictionBehavior;
