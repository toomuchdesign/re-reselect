import {describe} from 'vitest';
import {FifoObjectCache} from '../../src/index';
import testBasicBehavior from './test-utils/testBasicBehavior';
import testFifoBehavior from './test-utils/testFifoBehavior';
import testCacheSizeOptionValidation from './test-utils/testCacheSizeOptionValidation';
import testObjectCacheKeyBehavior from './test-utils/testObjectCacheKeyBehavior';

describe('FifoObjectCache', () => {
  testBasicBehavior(() => new FifoObjectCache({cacheSize: 10}));
  testFifoBehavior(FifoObjectCache);
  testCacheSizeOptionValidation(FifoObjectCache);
  testObjectCacheKeyBehavior(() => new FifoObjectCache({cacheSize: 10}));
});
