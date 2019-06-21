import fillCacheWith from './fillCacheWith';

function testMapCacheKeyBehavior(CacheObject, options) {
  describe('cacheKey', () => {
    describe('isValidCacheKey method', () => {
      it("doesn't not exist", () => {
        const cache = new CacheObject(options);
        expect(cache.isValidCacheKey).toBe(undefined);
      });
    });

    it('any kind of value works as cache key', () => {
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
