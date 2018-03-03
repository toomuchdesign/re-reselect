import CacheObject from '../FlatMapCacheObject';
import testBasicBehavior from '../__util__/testBasicBehavior';
import testMapCacheKeyBehavior from '../__util__/testMapCacheKeyBehavior';

describe('FlatMapCacheObject', () => {
  testBasicBehavior(CacheObject);
  testMapCacheKeyBehavior(CacheObject);
});
