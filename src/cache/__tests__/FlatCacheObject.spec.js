import CacheObject from '../FlatCacheObject';
import testBasicBehavior from '../__util__/testBasicBehavior';
import testObjectCacheKeyBehavior from '../__util__/testObjectCacheKeyBehavior';

describe('FlatCacheObject', () => {
  testBasicBehavior(CacheObject);
  testObjectCacheKeyBehavior(CacheObject);
});
