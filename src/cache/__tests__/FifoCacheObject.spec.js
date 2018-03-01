import CacheObject from '../FifoCacheObject';
import * as validateCacheSize from '../util/validateCacheSize';
import testBasicBehavior from '../__util__/testBasicBehavior';
import testFifoBehavior from '../__util__/testFifoBehavior';

describe('FifoCacheObject', () => {
  testBasicBehavior(CacheObject, {cacheSize: 10});
  testFifoBehavior(CacheObject);

  describe('isValidCacheKey', () => {
    it('Should accept only numbers and string', () => {
      const cache = new CacheObject({cacheSize: 5});
      const validValues = [1, 1.2, -5, 'foo', '12'];
      const invalidValues = [{}, [], null, undefined, new Map()];

      validValues.forEach(value => {
        const actual = cache.isValidCacheKey(value);
        expect(actual).toBe(true);
      });

      invalidValues.forEach(value => {
        const actual = cache.isValidCacheKey(value);
        expect(actual).toBe(false);
      });
    });
  });
});
