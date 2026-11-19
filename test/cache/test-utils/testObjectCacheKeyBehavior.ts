import { describe, expect, it } from 'vitest';

import { type ICacheObject, createCachedSelector } from '../../../src';

function testObjectCacheKeyBehavior(makeCacheObject: () => ICacheObject) {
  it('treats a numeric key and its string form as the same entry', () => {
    const cache = makeCacheObject();
    cache.set(1, 'old');
    expect(cache.get('1')).toBe('old');
    cache.set('1', 'new');
    expect(cache.get(1)).toBe('new');
    cache.remove('1');
    expect(cache.get(1)).toBeUndefined();
  });

  const prototypeKeys = [
    'constructor',
    'toString',
    'valueOf',
    'hasOwnProperty',
    '__proto__',
  ];

  describe.each(prototypeKeys)('prototype key %s', (key) => {
    it('misses before insertion and after removal', () => {
      const cache = makeCacheObject();

      expect(cache.get(key)).toBeUndefined();
      const value = () => 'cached';
      cache.set(key, value);
      expect(cache.get(key)).toBe(value);
      cache.remove(key);
      expect(cache.get(key)).toBeUndefined();
    });

    it('misses after clearing and can be stored again', () => {
      const cache = makeCacheObject();
      cache.clear();

      expect(cache.get(key)).toBeUndefined();
      const value = () => 'cached';
      cache.set(key, value);
      expect(cache.get(key)).toBe(value);
      cache.clear();
      expect(cache.get(key)).toBeUndefined();
    });

    it('creates and reuses a selector before and after clearing', () => {
      const selector = createCachedSelector(
        (state: { a: number; b: number }, _key: string) => state.a,
        (state: { a: number; b: number }, _key: string) => state.b,
        (a, b) => a + b,
      )({
        keySelector: (_state, key) => key,
        cacheObject: makeCacheObject(),
      });
      const state = { a: 1, b: 2 };

      expect(selector(state, key)).toBe(3);
      const cached = selector.getMatchingSelector(state, key);
      expect(cached).toBeDefined();
      expect(selector(state, key)).toBe(3);
      expect(selector.getMatchingSelector(state, key)).toBe(cached);

      selector.clearCache();
      expect(selector(state, key)).toBe(3);
      expect(selector.getMatchingSelector(state, key)).not.toBe(cached);
    });
  });

  describe('isValidCacheKey method', () => {
    it('accepts only numbers and string', () => {
      const cache = makeCacheObject();
      const validValues = [1, 1.2, -5, 'foo', '12'];
      const invalidValues = [{}, [], null, undefined, new Map()];

      const { isValidCacheKey } = cache;
      if (!isValidCacheKey) {
        throw 'Missing cache.isValidCacheKey method';
      }

      validValues.forEach((value) => {
        const actual = isValidCacheKey(value);
        expect(actual).toBe(true);
      });

      invalidValues.forEach((value) => {
        const actual = isValidCacheKey(value);
        expect(actual).toBe(false);
      });
    });
  });
}

export default testObjectCacheKeyBehavior;
