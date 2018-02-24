import LruCacheObject from '../LruCacheObject';
import * as validateCacheSize from '../util/validateCacheSize';

function newCache(cacheSize) {
  return new LruCacheObject({cacheSize});
}

function fillCache(cache, entries = []) {
  entries.forEach(entry => cache.set(entry, entry));
  return cache;
}

describe('LruCacheObject', () => {
  it('Should return cached value', () => {
    const cache = newCache(5);
    const actual = () => {};

    cache.set('foo', actual);
    const expected = cache.get('foo');

    expect(actual).toBe(expected);
  });

  it('Should remove a single item', () => {
    const cache = newCache(5);
    const entries = [1, 2, 3, 4, 5];
    fillCache(cache, entries);

    cache.remove(3);

    expect(cache.get(3)).toBe(undefined);
  });

  it('Should remove a single item und update cache ordering', () => {
    const cache = newCache(5);
    const entries = [1, 2, 3, 4, 5];
    fillCache(cache, entries);

    cache.remove(3);
    cache.set(6, 6);

    expect(cache.get(3)).toBe(undefined);
    [1, 2, 4, 5, 6].forEach(entry => {
      expect(cache.get(entry)).toBe(entry);
    });
  });

  it('Should clear the cache', () => {
    const cache = newCache(5);
    const entries = [1, 2, 3, 4, 5];
    fillCache(cache, entries);

    cache.clear();

    [1, 2, 3, 4, 5].forEach(entry => {
      expect(cache.get(entry)).toBe(undefined);
    });
  });

  it('Should limit cache queue by removing the least recently used item', () => {
    const cache = newCache(5);

    const entries = [0, 1, 2];
    const newEntries = [3, 4, 5];
    fillCache(cache, entries);
    cache.get(0);
    fillCache(cache, newEntries);

    expect(cache.get(0)).toBe(0);
    expect(cache.get(1)).toBe(undefined);
    expect(cache.get(2)).toBe(2);
    newEntries.forEach(entry => {
      expect(cache.get(entry)).toBe(entry);
    });
  });

  it('Should validate `cacheSize` parameter', () => {
    const spy = jest.spyOn(validateCacheSize, 'default');
    newCache(5);

    expect(spy).toHaveBeenCalledWith(5);
    spy.mockRestore();
  });
});
