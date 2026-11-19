import { describe, expect, it } from 'vitest';

import type { ICacheObject } from '../../../src/';
import fillCacheWith from './fillCacheWith';

function testFifoBehavior(
  CacheObject: new (options: { cacheSize: number }) => ICacheObject,
) {
  describe('FIFO cache behavior', () => {
    it('preserves insertion order when an existing key is overwritten', () => {
      const cache = new CacheObject({ cacheSize: 2 });
      cache.set('a', 1);
      cache.set('a', 2);
      cache.set('b', 3);
      expect(cache.get('a')).toBe(2);
      expect(cache.get('b')).toBe(3);
      cache.set('a', 4);
      cache.set('c', 5);
      expect(cache.get('a')).toBeUndefined();
      expect(cache.get('b')).toBe(3);
      expect(cache.get('c')).toBe(5);
    });

    it('limits cache queue by removing the first added items', () => {
      const cache = new CacheObject({ cacheSize: 5 });
      const entries = [1, 2, 3, 4];
      const newEntries = [5, 6, 7];

      fillCacheWith(cache, entries);
      fillCacheWith(cache, newEntries);

      expect(cache.get(1)).toBe(undefined);
      expect(cache.get(2)).toBe(undefined);
      [4, 5, 6, 7].forEach((entry) => {
        expect(cache.get(entry)).toBe(entry);
      });
    });

    it('mantains cache updated after removing extraneous entry', () => {
      const cache = new CacheObject({ cacheSize: 5 });
      const entries = [1, 2, 3, 4, 5];
      fillCacheWith(cache, entries);

      cache.remove(7); // Extraneous
      cache.remove(3);
      cache.set(6, 6);
      cache.set(7, 7);

      expect(cache.get(1)).toBe(undefined);
      expect(cache.get(3)).toBe(undefined);

      [2, 4, 5, 6, 7].forEach((entry) => {
        expect(cache.get(entry)).toBe(entry);
      });
    });
  });
}

export default testFifoBehavior;
