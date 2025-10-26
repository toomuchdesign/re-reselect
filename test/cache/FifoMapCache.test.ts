import {describe} from 'vitest';
import {FifoMapCache} from '../../src/index';
import testFifoBehavior from './test-utils/testFifoBehavior';
import testBasicBehavior from './test-utils/testBasicBehavior';
import testCacheSizeOptionValidation from './test-utils/testCacheSizeOptionValidation';
import testMapCacheKeyBehavior from './test-utils/testMapCacheKeyBehavior';

describe('FifoMapCache', () => {
  testBasicBehavior(() => new FifoMapCache({cacheSize: 10}));
  testFifoBehavior(FifoMapCache);
  testCacheSizeOptionValidation(FifoMapCache);
  testMapCacheKeyBehavior(() => new FifoMapCache({cacheSize: 10}));
});
