import CacheObject from '../FlatMapCacheObject';
import testBasicBehavior from '../__util__/testBasicBehavior';
import fillCacheWith from '../__util__/fillCacheWith';

describe('FlatMapCacheObject', () => {
  testBasicBehavior(CacheObject);

  it('Should handle any kind of cache key', () => {
    const cache = new CacheObject(CacheObject);
    const entries = new Set([1, {}, 3, [], null]);

    fillCacheWith(cache, entries);

    entries.forEach(entry => {
      expect(cache.get(entry)).toBe(entry);
    });
  });
});
