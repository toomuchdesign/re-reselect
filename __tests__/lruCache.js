import { LruCacheObject } from '../index';

function fillCache(cache, entries = []) {
  entries.map(entry => cache.set(entry, entry));
  return cache;
}

describe('LruCacheObject', () => {
  it('Should return cached value', () => {
    const cache = new LruCacheObject({ cacheSize: 5 });
    const actual = () => {};

    cache.set('foo', actual);
    const expected = cache.get('foo');

    expect(actual).toBe(expected);
  });

  it('Should remove a single item', () => {
    const cache = new LruCacheObject({ cacheSize: 5 });
    const newEntries = [1, 2, 3, 4, 5];
    fillCache(cache, newEntries);

    cache.remove(3);

    expect(cache.get(3)).toBe(undefined);
    [1, 2, 4, 5].map( entry => {
      expect(cache.get(entry)).toBe(entry);
    });
  });

  it('Should clear the cache', () => {
    const cache = new LruCacheObject({ cacheSize: 5 });
    const newEntries = [1, 2, 3, 4, 5];
    fillCache(cache, newEntries);

    cache.clear();

    newEntries.map( entry => {
      expect(cache.get(entry)).toBe(undefined);
    });
  });

  it('Should limit cache queue by removing the least recently used item', () => {
    const cache = new LruCacheObject({ cacheSize: 5 });

    const newEntries1 = [0, 1, 2];
    const newEntries2 = [3, 4, 5];
    fillCache(cache, newEntries1);
    cache.get(0);
    fillCache(cache, newEntries2);

    expect(cache.get(0)).toBe(0);
    expect(cache.get(1)).toBe(undefined);
    expect(cache.get(2)).toBe(2);
    newEntries2.map(entry => {
      expect(cache.get(entry)).toBe(entry);
    });
  });
});
