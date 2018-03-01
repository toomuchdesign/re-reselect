import CacheObject from '../FifoMapCacheObject';
import testFifoBehavior from '../__util__/testFifoBehavior';
import testBasicBehavior from '../__util__/testBasicBehavior';
import fillCacheWith from '../__util__/fillCacheWith';

describe('FifoMapCacheObject', () => {
  testBasicBehavior(CacheObject, {cacheSize: 10});
  testFifoBehavior(CacheObject);

  it('Should handle any kind of cache key', () => {
    const cache = new CacheObject({cacheSize: 5});
    const entries = new Set([1, {}, 3, [], null]);

    fillCacheWith(cache, entries);

    entries.forEach(entry => {
      expect(cache.get(entry)).toBe(entry);
    });
  });
});
