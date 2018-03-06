import validateCacheSize from './util/validateCacheSize';

export default class LruMapCache {
  constructor({cacheSize} = {}) {
    validateCacheSize(cacheSize);
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
    const value = this._cache.get(key);

    // Register cache hit
    if (this._cache.has(key)) {
      this.remove(key);
      this._cache.set(key, value);
    }
    return value;
  }
  remove(key) {
    this._cache.delete(key);
  }
  clear() {
    this._cache.clear();
  }
}
