import {FlatObjectCache as CacheObject} from '../../../src/index';
import testBasicBehavior from '../__util__/testBasicBehavior';
import testObjectCacheKeyBehavior from '../__util__/testObjectCacheKeyBehavior';

describe('FlatObjectCache', () => {
  testBasicBehavior(CacheObject);
  testObjectCacheKeyBehavior(CacheObject);
});
