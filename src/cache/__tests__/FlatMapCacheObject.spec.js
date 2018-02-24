import FlatMapCacheObject from '../FlatMapCacheObject';

function fillCache(cache, entries = []) {
  entries.forEach(entry => cache.set(entry, entry));
  return cache;
}

describe('FlatMapCacheObject', () => {
  it('Should return cached value', () => {
    const cache = new FlatMapCacheObject();
    const actual = () => {};
    const cacheKey = {};

    cache.set(cacheKey, actual);
    const expected = cache.get(cacheKey);

    expect(actual).toBe(expected);
  });

  it('Should remove a single item', () => {
    const cache = new FlatMapCacheObject();
    const entries = new Set([1, {}, 3, [], null]);
    fillCache(cache, entries);

    entries.delete(3);
    cache.remove(3);

    expect(cache.get(3)).toBe(undefined);
    entries.forEach(entry => {
      expect(cache.get(entry)).toEqual(entry);
    });
  });

  it('Should clear the cache', () => {
    const cache = new FlatMapCacheObject();
    const entries = new Set([1, {}, 3, [], null]);
    fillCache(cache, entries);

    cache.clear();

    entries.forEach(entry => {
      expect(cache.get(entry)).toBe(undefined);
    });
  });
});
