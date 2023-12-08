import {FifoObjectCache} from '../../index';
import testBasicBehavior from '../__util__/testBasicBehavior';
import testFifoBehavior from '../__util__/testFifoBehavior';
import testCacheSizeOptionValidation from '../__util__/testCacheSizeOptionValidation';
import testObjectCacheKeyBehavior from '../__util__/testObjectCacheKeyBehavior';

describe('FifoObjectCache', () => {
  testBasicBehavior(() => new FifoObjectCache({cacheSize: 10}));
  testFifoBehavior(FifoObjectCache);
  testCacheSizeOptionValidation(FifoObjectCache);
  testObjectCacheKeyBehavior(() => new FifoObjectCache({cacheSize: 10}));
});
