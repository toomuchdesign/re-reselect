import { describe } from 'vitest';

import { LruObjectCache } from '../../src/index';
import testBasicBehavior from './test-utils/testBasicBehavior';
import testCacheSizeOptionValidation from './test-utils/testCacheSizeOptionValidation';
import testLruBehavior from './test-utils/testLruBehavior';
import testObjectCacheKeyBehavior from './test-utils/testObjectCacheKeyBehavior';

describe('LruObjectCache', () => {
  testBasicBehavior(() => new LruObjectCache({ cacheSize: 10 }));
  testLruBehavior(LruObjectCache);
  testCacheSizeOptionValidation(LruObjectCache);
  testObjectCacheKeyBehavior(() => new LruObjectCache({ cacheSize: 10 }));
});
