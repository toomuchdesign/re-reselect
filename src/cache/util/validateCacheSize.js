function validateCacheSize(cacheSize) {
  if (cacheSize === undefined) {
    throw new Error('Missing the required property "cacheSize".');
  }
  if (!Number.isInteger(cacheSize) || cacheSize <= 0) {
    throw new Error(
      'The "cacheSize" property must be a positive integer value.'
    );
  }
}

export default validateCacheSize;
