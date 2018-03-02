function testCacheSizeValidation(CacheObject) {
  describe('cacheSize option validation', () => {
    it('Should throw error if not defined', () => {
      expect(() => {
        const cache = new CacheObject();
      }).toThrow(/Missing/);
    });

    it('Should throw error if not a positive integer', () => {
      const wrongValues = [2.5, -12, 0];

      wrongValues.forEach(value => {
        expect(() => {
          const cache = new CacheObject({cacheSize: value});
        }).toThrow(/a positive integer/);
      });
    });

    it('Should not throw if a positive integer', () => {
      expect(() => {
        const cache = new CacheObject({cacheSize: 22});
      }).not.toThrow();
    });
  });
}

export default testCacheSizeValidation;
