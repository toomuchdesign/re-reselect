import {FlatCacheObject as CacheObject} from '../../../../src/index';

describe('FlatCacheObject (deprecated)', () => {
  it('Should return "FlatObjectCache" class', () => {
    expect(CacheObject.name).toBe('FlatObjectCache');
  });
});
