import {FifoMapCache} from '../../index';
import testFifoBehavior from '../__util__/testFifoBehavior';
import testBasicBehavior from '../__util__/testBasicBehavior';
import testCacheSizeOptionValidation from '../__util__/testCacheSizeOptionValidation';
import testMapCacheKeyBehavior from '../__util__/testMapCacheKeyBehavior';

describe('FifoMapCache', () => {
  testBasicBehavior(() => new FifoMapCache({cacheSize: 10}));
  testFifoBehavior(FifoMapCache);
  testCacheSizeOptionValidation(FifoMapCache);
  testMapCacheKeyBehavior(() => new FifoMapCache({cacheSize: 10}));
});
