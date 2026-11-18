import { describe, expect, it } from 'vitest';

import {
  LruMapCache,
  LruObjectCache,
  createCachedSelector,
} from '../../src/index';

describe.each([LruMapCache, LruObjectCache])('%s cache miss', (Cache) => {
  it('continues enforcing the cache size after looking up absent keys', () => {
    const cache = new Cache({ cacheSize: 2 });
    const a = () => 'a';
    const b = () => 'b';
    cache.set('a', a);
    cache.set('b', b);
    expect(cache.get('missing-1')).toBeUndefined();
    expect(cache.get('missing-2')).toBeUndefined();
    cache.set('c', () => 'c');
    cache.set('d', () => 'd');
    cache.set('e', () => 'e');
    expect(cache.get('c')).toBeUndefined();
  });
});

it('does not count missing selectors toward the LRU cache size', () => {
  const selector = createCachedSelector(
    (_state: object, key: string) => key,
    (key) => key,
  )({
    keySelector: (_state: object, key: string) => key,
    cacheObject: new LruObjectCache({ cacheSize: 2 }),
  });
  const state = {};
  selector(state, 'a');
  selector(state, 'b');
  expect(selector.getMatchingSelector(state, 'missing-1')).toBeUndefined();
  expect(selector.getMatchingSelector(state, 'missing-2')).toBeUndefined();
  selector(state, 'c');
  selector(state, 'd');
  selector(state, 'e');
  expect(selector.getMatchingSelector(state, 'c')).toBeUndefined();
});
