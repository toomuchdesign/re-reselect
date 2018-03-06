import {LruObjectCache as CacheObject} from '../../index';
import testBasicBehavior from '../__util__/testBasicBehavior';
import testLruBehavior from '../__util__/testLruBehavior';
import testCacheSizeOptionValidation from '../__util__/testCacheSizeOptionValidation';
import testObjectCacheKeyBehavior from '../__util__/testObjectCacheKeyBehavior';

describe('LruObjectCache', () => {
  testBasicBehavior(CacheObject, {cacheSize: 10});
  testLruBehavior(CacheObject);
  testCacheSizeOptionValidation(CacheObject);
  testObjectCacheKeyBehavior(CacheObject, {cacheSize: 10});
});
