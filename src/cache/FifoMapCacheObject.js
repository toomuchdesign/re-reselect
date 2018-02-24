export default class FifoMapCacheObject {
  constructor({cacheSize} = {}) {
    if (cacheSize === undefined) {
      throw new Error('Missing the required property `cacheSize`.');
    }
    if (!Number.isInteger(cacheSize) || cacheSize <= 0) {
      throw new Error(
        'The `cacheSize` property must be a positive integer value.'
      );
    }
    this._cache = new Map();
    this._cacheSize = cacheSize;
  }
  set(key, selectorFn) {
    this._cache.set(key, selectorFn);

    if (this._cache.size > this._cacheSize) {
      const earliest = this._cache.keys().next().value;
      this.remove(earliest);
    }
  }
  get(key) {
    return this._cache.get(key);
  }
  remove(key) {
    this._cache.delete(key);
  }
  clear() {
    this._cache.clear();
  }
  isCacheKeyValid() {
    return true;
  }
}
