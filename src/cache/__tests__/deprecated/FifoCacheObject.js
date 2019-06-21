import {FifoCacheObject as CacheObject} from '../../../../src/index';

describe('FifoCacheObject (deprecated)', () => {
  it('returns "FifoObjectCache" class', () => {
    expect(CacheObject.name).toBe('FifoObjectCache');
  });
});
