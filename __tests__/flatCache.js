import { FlatCacheObject } from '../index';

const selectorFn = () => {};

describe('FlatCacheObject', () => {
  it('Should return cached value', () => {
    const cache = new FlatCacheObject();
    cache.set('foo', selectorFn);

    const value = cache.get('foo');

    expect(value).toBe(selectorFn);
  });
});
