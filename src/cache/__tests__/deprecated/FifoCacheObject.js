import {FifoCacheObject as CacheObject} from '../../../index';

describe('FifoCacheObject (deprecated)', () => {
  it('Should return "FifoObjectCache" class', () => {
    expect(CacheObject.name).toBe('FifoObjectCache');
  });
});
