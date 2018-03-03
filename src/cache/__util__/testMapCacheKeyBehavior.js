import fillCacheWith from './fillCacheWith';

function testMapCacheKeyBehavior(CacheObject, options) {
  describe('cacheKey', () => {
    describe('isValidCacheKey method', () => {
      it('Should not exist', () => {
        const cache = new CacheObject(options);
        expect(cache.isValidCacheKey).toBe(undefined);
      });
    });

    it('Any kind of value should work as cache key', () => {
      const cache = new CacheObject(options);
      const entries = new Set([1, {}, 3, [], null]);

      fillCacheWith(cache, entries);

      entries.forEach(entry => {
        expect(cache.get(entry)).toBe(entry);
      });
    });
  });
}

export default testMapCacheKeyBehavior;
