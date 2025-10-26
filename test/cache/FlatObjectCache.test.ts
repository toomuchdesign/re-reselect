import { describe } from 'vitest';

import { FlatObjectCache } from '../../src/index';
import testBasicBehavior from './test-utils/testBasicBehavior';
import testObjectCacheKeyBehavior from './test-utils/testObjectCacheKeyBehavior';

describe('FlatObjectCache', () => {
  testBasicBehavior(() => new FlatObjectCache());
  testObjectCacheKeyBehavior(() => new FlatObjectCache());
});
