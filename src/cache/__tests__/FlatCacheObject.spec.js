import FlatCacheObject from '../FlatCacheObject';

function fillCache(cache, entries = []) {
  entries.map(entry => cache.set(entry, entry));
  return cache;
}

describe('FlatCacheObject', () => {
  it('Should return cached value', () => {
    const cache = new FlatCacheObject();
    const actual = () => {};

    cache.set('foo', actual);
    const expected = cache.get('foo');

    expect(actual).toBe(expected);
  });

  it('Should remove a single item', () => {
    const cache = new FlatCacheObject();
    const newEntries = [1, 2, 3, 4, 5];
    fillCache(cache, newEntries);

    cache.remove(3);

    expect(cache.get(3)).toBe(undefined);
    [1, 2, 4, 5].map(entry => {
      expect(cache.get(entry)).toBe(entry);
    });
  });

  it('Should clear the cache', () => {
    const cache = new FlatCacheObject();

    const newEntries = [1, 2, 3, 4, 5];
    fillCache(cache, newEntries);
    cache.clear();

    newEntries.map(entry => {
      expect(cache.get(entry)).toBe(undefined);
    });
  });
});
