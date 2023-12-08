import {LruObjectCache} from '../../index';
import testBasicBehavior from '../__util__/testBasicBehavior';
import testLruBehavior from '../__util__/testLruBehavior';
import testCacheSizeOptionValidation from '../__util__/testCacheSizeOptionValidation';
import testObjectCacheKeyBehavior from '../__util__/testObjectCacheKeyBehavior';

describe('LruObjectCache', () => {
  testBasicBehavior(() => new LruObjectCache({cacheSize: 10}));
  testLruBehavior(LruObjectCache);
  testCacheSizeOptionValidation(LruObjectCache);
  testObjectCacheKeyBehavior(() => new LruObjectCache({cacheSize: 10}));
});
