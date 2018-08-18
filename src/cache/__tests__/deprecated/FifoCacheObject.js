import {FifoCacheObject as CacheObject} from '../../../../src/index';

describe('FifoCacheObject (deprecated)', () => {
  it('Should return "FifoObjectCache" class', () => {
    expect(CacheObject.name).toBe('FifoObjectCache');
  });
});
