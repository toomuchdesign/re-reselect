import {LruCacheObject as CacheObject} from '../../../../src/index';

describe('LruCacheObject (deprecated)', () => {
  it('returns "LruMapCache" class', () => {
    expect(CacheObject.name).toBe('LruMapCache');
  });
});
