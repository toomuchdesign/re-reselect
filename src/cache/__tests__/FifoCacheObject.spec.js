import CacheObject from '../FifoCacheObject';
import testBasicBehavior from '../__util__/testBasicBehavior';
import testFifoBehavior from '../__util__/testFifoBehavior';
import testCacheSizeOptionValidation from '../__util__/testCacheSizeOptionValidation';
import testObjectCacheKeyBehavior from '../__util__/testObjectCacheKeyBehavior';

describe('FifoCacheObject', () => {
  testBasicBehavior(CacheObject, {cacheSize: 10});
  testFifoBehavior(CacheObject);
  testCacheSizeOptionValidation(CacheObject);
  testObjectCacheKeyBehavior(CacheObject, {cacheSize: 10});
});
