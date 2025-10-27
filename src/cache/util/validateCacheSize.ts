function validateCacheSize(cacheSize: unknown): asserts cacheSize is number {
  if (
    typeof cacheSize === 'number' &&
    Number.isInteger(cacheSize) &&
    cacheSize > 0
  ) {
    return;
  }

  if (cacheSize === undefined) {
    throw new Error('Missing the required property "cacheSize".');
  }

  throw new Error('The "cacheSize" property must be a positive integer value.');
}

export default validateCacheSize;
