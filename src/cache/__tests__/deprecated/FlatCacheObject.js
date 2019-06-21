import {FlatCacheObject as CacheObject} from '../../../../src/index';

describe('FlatCacheObject (deprecated)', () => {
  it('returns "FlatObjectCache" class', () => {
    expect(CacheObject.name).toBe('FlatObjectCache');
  });
});
