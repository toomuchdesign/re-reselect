import validateCacheSize from '../validateCacheSize';

describe('validateCacheSize', () => {
  it('Should throw error if `cacheSize` is not defined', () => {
    expect(() => {
      validateCacheSize();
    }).toThrow(/Missing/);
  });

  it('Should throw error if `cacheSize` is not a positive integer', () => {
    const wrongValues = [2.5, -12, 0];

    wrongValues.forEach(value => {
      expect(() => {
        validateCacheSize(value);
      }).toThrow(/a positive integer/);
    });
  });

  it('Should not throw if `cacheSize` is a positive integer', () => {
    expect(() => {
      validateCacheSize(2);
    }).not.toThrow();
  });
});
