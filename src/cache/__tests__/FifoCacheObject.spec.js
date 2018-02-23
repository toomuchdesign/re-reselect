import FifoCacheObject from '../FifoCacheObject';

function newCache(cacheSize) {
  return new FifoCacheObject({cacheSize});
}

function fillCache(cache, entries = []) {
  entries.forEach(entry => cache.set(entry, entry));
  return cache;
}

describe('FifoCacheObject', () => {
  it('Should return cached value', () => {
    const cache = newCache(5);
    const actual = () => {};

    cache.set('foo', actual);
    const expected = cache.get('foo');

    expect(actual).toBe(expected);
  });

  it('Should limit cache queue by removing the first added items', () => {
    const cache = newCache(5);
    const entries = [1, 2, 3, 4];
    const newEntries = [5, 6, 7];

    fillCache(cache, entries);
    fillCache(cache, newEntries);

    expect(cache.get(1)).toBe(undefined);
    expect(cache.get(2)).toBe(undefined);
    [4, 5, 6, 7].forEach(entry => {
      expect(cache.get(entry)).toBe(entry);
    });
  });

  it('Should remove a single item', () => {
    const cache = newCache(5);
    const entries = [1, 2, 3, 4, 5];
    fillCache(cache, entries);

    cache.remove(3);

    expect(cache.get(3)).toBe(undefined);
    [1, 2, 4, 5].forEach(entry => {
      expect(cache.get(entry)).toBe(entry);
    });
  });

  it('Should mantain cache updated after removing extraneous entry', () => {
    const cache = newCache(5);
    const entries = [1, 2, 3, 4, 5];
    fillCache(cache, entries);

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

  it('Should clear the cache', () => {
    const cache = newCache(5);
    const entries = [1, 2, 3, 4, 5];
    fillCache(cache, entries);

    cache.clear();

    [1, 2, 3, 4, 5].forEach(entry => {
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
        cacheSize: 2.5,
      });
    }).toThrow(/a positive integer/);
  });
});
