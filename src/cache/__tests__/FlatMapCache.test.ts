import {FlatMapCache} from '../../index';
import testBasicBehavior from '../__util__/testBasicBehavior';
import testMapCacheKeyBehavior from '../__util__/testMapCacheKeyBehavior';

describe('FlatMapCache', () => {
  testBasicBehavior(() => new FlatMapCache());
  testMapCacheKeyBehavior(() => new FlatMapCache());
});
