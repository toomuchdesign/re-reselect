import {RrMapCache as CacheObject} from '../../../src/index';
import testBasicBehavior from '../__util__/testBasicBehavior';
import testRrBehavior from '../__util__/testRrBehavior';
import testCacheSizeOptionValidation from '../__util__/testCacheSizeOptionValidation';
import testMapCacheKeyBehavior from '../__util__/testMapCacheKeyBehavior';

describe('RrMapCache', () => {
  testBasicBehavior(CacheObject, {cacheSize: 10});
  testRrBehavior(CacheObject);
  testCacheSizeOptionValidation(CacheObject);
  testMapCacheKeyBehavior(CacheObject, {cacheSize: 10});
});
