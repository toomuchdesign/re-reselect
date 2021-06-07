import fillCacheWith from './fillCacheWith';

function testRrBehavior(CacheObject) {
  describe('RR cache behavior', () => {
    it('limits cache size by removing a random item', () => {
      const cache = new CacheObject({cacheSize: 5});
      const entries = [1, 2, 3, 4, 5, 6];
      const get = cache.get.bind(cache);
      fillCacheWith(cache, entries);
      expect(entries.every(get)).toBe(false);
    });

    it('shrinks when removing existing items manually', () => {
      const cache = new CacheObject({cacheSize: 5});
      const entries = [1, 2, 3, 4, 5];
      const get = cache.get.bind(cache);
      fillCacheWith(cache, entries);
      expect(entries.every(get)).toBe(true);
      cache.remove('non-existant');
      cache.remove(5);
      expect(cache.get(5)).toBeUndefined();
      cache.set(5, 5);
      expect(entries.every(get)).toBe(true);
      cache.set(6, 6);
      expect(entries.every(get)).toBe(false);
    });
  });
}

export default testRrBehavior;
