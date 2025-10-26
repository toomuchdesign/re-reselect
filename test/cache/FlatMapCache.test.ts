import { describe } from 'vitest';

import { FlatMapCache } from '../../src/index';
import testBasicBehavior from './test-utils/testBasicBehavior';
import testMapCacheKeyBehavior from './test-utils/testMapCacheKeyBehavior';

describe('FlatMapCache', () => {
  testBasicBehavior(() => new FlatMapCache());
  testMapCacheKeyBehavior(() => new FlatMapCache());
});
