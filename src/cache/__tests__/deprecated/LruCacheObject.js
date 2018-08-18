import {LruCacheObject as CacheObject} from '../../../../src/index';

describe('LruCacheObject (deprecated)', () => {
  it('Should return "LruMapCache" class', () => {
    expect(CacheObject.name).toBe('LruMapCache');
  });
});
