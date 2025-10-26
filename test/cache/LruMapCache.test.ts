import {describe} from 'vitest';
import {LruMapCache} from '../../src/index';
import testBasicBehavior from './test-utils/testBasicBehavior';
import testLruBehavior from './test-utils/testLruBehavior';
import testCacheSizeOptionValidation from './test-utils/testCacheSizeOptionValidation';
import testMapCacheKeyBehavior from './test-utils/testMapCacheKeyBehavior';

describe('LruMapCache', () => {
  testBasicBehavior(() => new LruMapCache({cacheSize: 10}));
  testLruBehavior(LruMapCache);
  testCacheSizeOptionValidation(LruMapCache);
  testMapCacheKeyBehavior(() => new LruMapCache({cacheSize: 10}));
});
