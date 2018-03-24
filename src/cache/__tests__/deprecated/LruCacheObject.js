import {LruCacheObject as CacheObject} from '../../../index';

describe('LruCacheObject (deprecated)', () => {
  it('Should return "LruMapCache" class', () => {
    expect(CacheObject.name).toBe('LruMapCache');
  });
});
