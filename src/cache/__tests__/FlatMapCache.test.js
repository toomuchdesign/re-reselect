import {FlatMapCache as CacheObject} from '../../../src/index';
import testBasicBehavior from '../__util__/testBasicBehavior';
import testMapCacheKeyBehavior from '../__util__/testMapCacheKeyBehavior';

describe('FlatMapCache', () => {
  testBasicBehavior(CacheObject);
  testMapCacheKeyBehavior(CacheObject);
});
