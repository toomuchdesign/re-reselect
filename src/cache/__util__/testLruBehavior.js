import fillCacheWith from './fillCacheWith';
import * as validateCacheSize from '../util/validateCacheSize';

function testLruBehavior(CacheObject) {
  describe('LRU cache behavior', () => {
    it('Should remove an item and update cache ordering when another is added', () => {
      const cache = new CacheObject({cacheSize: 5});
      const entries = [1, 2, 3, 4, 5];
      fillCacheWith(cache, entries);

      cache.remove(3);
      cache.set(6, 6);

      expect(cache.get(3)).toBe(undefined);
      [1, 2, 4, 5, 6].forEach(entry => {
        expect(cache.get(entry)).toBe(entry);
      });
    });

    it('Should limit cache queue by removing the least recently used item', () => {
      const cache = new CacheObject({cacheSize: 5});

      const entries = [0, 1, 2];
      const newEntries = [3, 4, 5];
      fillCacheWith(cache, entries);
      cache.get(0);
      fillCacheWith(cache, newEntries);

      expect(cache.get(0)).toBe(0);
      expect(cache.get(1)).toBe(undefined);
      expect(cache.get(2)).toBe(2);
      newEntries.forEach(entry => {
        expect(cache.get(entry)).toBe(entry);
      });
    });

    // @TODO Test the feature, not implementation
    it('Should validate `cacheSize` parameter', () => {
      const spy = jest.spyOn(validateCacheSize, 'default');
      const cache = new CacheObject({cacheSize: 5});

      expect(spy).toHaveBeenCalledWith(5);
      spy.mockRestore();
    });
  });
}

export default testLruBehavior;
