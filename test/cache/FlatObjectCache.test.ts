import { expectTypeOf } from 'expect-type';
import { describe, it } from 'vitest';

import { FlatObjectCache, createCachedSelector } from '../../src/index';
import testBasicBehavior from './test-utils/testBasicBehavior';
import testObjectCacheKeyBehavior from './test-utils/testObjectCacheKeyBehavior';

describe('FlatObjectCache', () => {
  testBasicBehavior(() => new FlatObjectCache());
  testObjectCacheKeyBehavior(() => new FlatObjectCache());

  it('exposes expected types', () => {
    type State = { foo: string };
    const fooSelector = (state: State) => state.foo;
    const combinerSelector = (foo: string) => foo;

    // Accepts this cache object as an option
    createCachedSelector(
      fooSelector,
      combinerSelector,
    )({
      keySelector: fooSelector,
      cacheObject: new FlatObjectCache(),
    });

    // Exposes the interface
    const cacheObject = new FlatObjectCache();
    cacheObject.set('foo', () => {});
    cacheObject.set(1, () => {});
    // @ts-expect-error
    cacheObject.set({}, () => {});

    expectTypeOf(cacheObject.get('foo')).toEqualTypeOf<any>();
    expectTypeOf(cacheObject.get(2)).toEqualTypeOf<any>();

    cacheObject.remove('foo');
    cacheObject.remove(1);
    cacheObject.clear();

    cacheObject.isValidCacheKey(1);
  });
});
