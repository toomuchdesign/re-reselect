import fillCacheWith from './fillCacheWith';

function testBasicBehavior(CacheObject, options) {
  describe('Cache basic behavior', () => {
    it('returns cached value', () => {
      const cache = new CacheObject(options);
      const actual = () => {};

      cache.set('foo', actual);
      const expected = cache.get('foo');

      expect(actual).toBe(expected);
    });

    it('removes a single item', () => {
      const cache = new CacheObject(options);
      const entries = [1, 2, 3, 4, 5];
      fillCacheWith(cache, entries);

      cache.remove(3);

      expect(cache.get(3)).toBe(undefined);
      [1, 2, 4, 5].forEach(entry => {
        expect(cache.get(entry)).toBe(entry);
      });
    });

    it('clears the cache', () => {
      const cache = new CacheObject(options);
      const entries = [1, 2, 3, 4, 5];
      fillCacheWith(cache, entries);

      cache.clear();

      [1, 2, 3, 4, 5].forEach(entry => {
        expect(cache.get(entry)).toBe(undefined);
      });
    });
  });
}

export default testBasicBehavior;
