import CacheObject from '../FifoMapCacheObject';
import testFifoBehavior from '../__util__/testFifoBehavior';
import testBasicBehavior from '../__util__/testBasicBehavior';
import testCacheSizeOptionValidation from '../__util__/testCacheSizeOptionValidation';
import testMapCacheKeyBehavior from '../__util__/testMapCacheKeyBehavior';

describe('FifoMapCacheObject', () => {
  testBasicBehavior(CacheObject, {cacheSize: 10});
  testFifoBehavior(CacheObject);
  testCacheSizeOptionValidation(CacheObject);
  testMapCacheKeyBehavior(CacheObject, {cacheSize: 10});
});
