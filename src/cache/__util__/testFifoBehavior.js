import fillCacheWith from './fillCacheWith';
import * as validateCacheSize from '../util/validateCacheSize';

function testFifoBehavior(CacheObject) {
  describe('FIFO cache behavior', () => {
    it('Should limit cache queue by removing the first added items', () => {
      const cache = new CacheObject({cacheSize: 5});
      const entries = [1, 2, 3, 4];
      const newEntries = [5, 6, 7];

      fillCacheWith(cache, entries);
      fillCacheWith(cache, newEntries);

      expect(cache.get(1)).toBe(undefined);
      expect(cache.get(2)).toBe(undefined);
      [4, 5, 6, 7].forEach(entry => {
        expect(cache.get(entry)).toBe(entry);
      });
    });

    it('Should mantain cache updated after removing extraneous entry', () => {
      const cache = new CacheObject({cacheSize: 5});
      const entries = [1, 2, 3, 4, 5];
      fillCacheWith(cache, entries);

      cache.remove(7); // Extraneous
      cache.remove(3);
      cache.set(6, 6);
      cache.set(7, 7);

      expect(cache.get(1)).toBe(undefined);
      expect(cache.get(3)).toBe(undefined);

      [2, 4, 5, 6, 7].forEach(entry => {
        expect(cache.get(entry)).toBe(entry);
      });
    });

    // @TODO Test the feature, not implementation
    it('Should validate `cacheSize` parameter', () => {
      const spy = jest.spyOn(validateCacheSize, 'default');
      new CacheObject({cacheSize: 5});

      expect(spy).toHaveBeenCalledWith(5);
      spy.mockRestore();
    });
  });
}

export default testFifoBehavior;
