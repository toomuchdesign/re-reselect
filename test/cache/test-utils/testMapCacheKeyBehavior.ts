import { describe, expect, it } from 'vitest';

import type { ICacheObject } from '../../../src/';
import fillCacheWith from './fillCacheWith';

function testMapCacheKeyBehavior(makeCacheObject: () => ICacheObject) {
  describe('cacheKey', () => {
    describe('isValidCacheKey method', () => {
      it("doesn't not exist", () => {
        const cache = makeCacheObject();
        expect(cache.isValidCacheKey).toBe(undefined);
      });
    });

    it('any kind of value works as cache key', () => {
      const cache = makeCacheObject();
      const entries = new Set([1, {}, 3, [], null]);

      fillCacheWith(cache, entries);

      entries.forEach((entry) => {
        expect(cache.get(entry)).toBe(entry);
      });
    });
  });
}

export default testMapCacheKeyBehavior;
