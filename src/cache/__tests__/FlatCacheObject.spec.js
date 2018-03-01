import CacheObject from '../FlatCacheObject';
import testBasicBehavior from '../__util__/testBasicBehavior';

describe('FlatCacheObject', () => {
  testBasicBehavior(CacheObject);

  describe('isValidCacheKey', () => {
    it('Should accept only numbers and string', () => {
      const cache = new CacheObject();
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
