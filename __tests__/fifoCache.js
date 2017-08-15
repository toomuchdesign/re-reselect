import { FifoCacheObject } from '../index';

function fillCache(cache, entries = []) {
  entries.map(entry => cache.set(entry, entry));
  return cache;
}

describe('FifoCacheObject', () => {
  it('Should return cached value', () => {
    const cache = new FifoCacheObject({ cacheSize: 5 });
    const actual = () => {};

    cache.set('foo', actual);
    const expected = cache.get('foo');

    expect(actual).toBe(expected);
  });

  it('Should limit cache queue by removing the first item', () => {
    const cache = new FifoCacheObject({ cacheSize: 5 });

    cache.set(0, 0);
    const newEntries = [1, 2, 3, 4, 5];
    fillCache(cache, newEntries)

    expect(cache.get(0)).toBe(undefined);
    newEntries.map(entry => {
      expect(cache.get(entry)).toBe(entry);
    });
  });

  it('Should remove a single item', () => {
    const cache = new FifoCacheObject({ cacheSize: 5 });
    const newEntries = [1, 2, 3, 4, 5];
    fillCache(cache, newEntries);

    cache.remove(3);

    expect(cache.get(3)).toBe(undefined);
    [1, 2, 4, 5].map( entry => {
      expect(cache.get(entry)).toBe(entry);
    });
  });

  it('Should clear the cache', () => {
    const cache = new FifoCacheObject({ cacheSize: 5 });

    const newEntries = [1, 2, 3, 4, 5];
    fillCache(cache, newEntries);
    cache.clear();

    newEntries.map( entry => {
      expect(cache.get(entry)).toBe(undefined);
    });
  });

  it('Should check mandatory `cacheSize` parameter', () => {
    expect(() => {
      const cache = new FifoCacheObject();
    }).toThrow(/Missing/);
  });

  it('Should check `cacheSize` parameter format', () => {
    expect(() => {
      const cache = new FifoCacheObject({
        cacheSize: 2.5
      });
    }).toThrow(/a positive integer/);
  });
});
