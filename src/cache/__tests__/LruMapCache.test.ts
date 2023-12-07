import {LruMapCache} from '../../index';
import testBasicBehavior from '../__util__/testBasicBehavior';
import testLruBehavior from '../__util__/testLruBehavior';
import testCacheSizeOptionValidation from '../__util__/testCacheSizeOptionValidation';
import testMapCacheKeyBehavior from '../__util__/testMapCacheKeyBehavior';

describe('LruMapCache', () => {
  testBasicBehavior(() => new LruMapCache({cacheSize: 10}));
  testLruBehavior(LruMapCache);
  testCacheSizeOptionValidation(LruMapCache);
  testMapCacheKeyBehavior(() => new LruMapCache({cacheSize: 10}));
});
