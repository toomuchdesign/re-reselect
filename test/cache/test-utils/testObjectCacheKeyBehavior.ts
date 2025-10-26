import {describe, expect, it} from 'vitest';
import type {ICacheObject} from '../../../src';

function testObjectCacheKeyBehavior(makeCacheObject: () => ICacheObject) {
  describe('isValidCacheKey method', () => {
    it('accepts only numbers and string', () => {
      const cache = makeCacheObject();
      const validValues = [1, 1.2, -5, 'foo', '12'];
      const invalidValues = [{}, [], null, undefined, new Map()];

      const {isValidCacheKey} = cache;
      if (!isValidCacheKey) {
        throw 'Missing cache.isValidCacheKey method';
      }

      validValues.forEach(value => {
        const actual = isValidCacheKey(value);
        expect(actual).toBe(true);
      });

      invalidValues.forEach(value => {
        const actual = isValidCacheKey(value);
        expect(actual).toBe(false);
      });
    });
  });
}

export default testObjectCacheKeyBehavior;
