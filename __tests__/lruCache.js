import { LruCacheObject } from '../index';

const selectorFn = () => {};

describe('LruCacheObject', () => {
  it('Should return cached value', () => {
    const cache = new LruCacheObject({ cacheSize: 10 });
    cache.set('foo', selectorFn);

    const value = cache.get('foo');

    expect(value).toBe(selectorFn);
  });
});
