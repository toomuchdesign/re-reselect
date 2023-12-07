import {FlatObjectCache} from '../../index';
import testBasicBehavior from '../__util__/testBasicBehavior';
import testObjectCacheKeyBehavior from '../__util__/testObjectCacheKeyBehavior';

describe('FlatObjectCache', () => {
  testBasicBehavior(() => new FlatObjectCache());
  testObjectCacheKeyBehavior(() => new FlatObjectCache());
});
