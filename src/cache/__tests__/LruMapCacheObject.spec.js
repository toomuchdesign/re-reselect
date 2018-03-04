import CacheObject from '../LruMapCacheObject';
import testBasicBehavior from '../__util__/testBasicBehavior';
import testLruBehavior from '../__util__/testLruBehavior';
import testCacheSizeOptionValidation from '../__util__/testCacheSizeOptionValidation';
import testMapCacheKeyBehavior from '../__util__/testMapCacheKeyBehavior';

describe('LruMapCacheObject', () => {
  testBasicBehavior(CacheObject, {cacheSize: 10});
  testLruBehavior(CacheObject);
  testCacheSizeOptionValidation(CacheObject);
  testMapCacheKeyBehavior(CacheObject, {cacheSize: 10});
});
