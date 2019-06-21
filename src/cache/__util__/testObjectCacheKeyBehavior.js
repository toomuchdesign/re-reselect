function testObjectCacheKeyBehavior(CacheObject, options) {
  describe('isValidCacheKey method', () => {
    it('accepts only numbers and string', () => {
      const cache = new CacheObject(options);
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
}

export default testObjectCacheKeyBehavior;
