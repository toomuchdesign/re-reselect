import { FifoCacheObject } from '../index';

const selectorFn = () => {};

describe('FifoCacheObject', () => {
  it('Should return cached value', () => {
    const cache = new FifoCacheObject({ cacheSize: 10 });
    cache.set('foo', selectorFn);

    const value = cache.get('foo');

    expect(value).toBe(selectorFn);
  });
});
