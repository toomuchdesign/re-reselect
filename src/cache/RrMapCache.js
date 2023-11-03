import validateCacheSize from './util/validateCacheSize';

export default class RrMapCache {
  constructor({cacheSize} = {}) {
    validateCacheSize(cacheSize);
    this.clear();
    this._cacheSize = cacheSize;
  }
  set(key, selectorFn) {
    if (this._cache.size >= this._cacheSize) {
      this._randomReplace(key, selectorFn);
    } else {
      this._cache.set(key, selectorFn);
      this._cacheKeys[this._cache.size] = key;
    }
  }
  get(key) {
    return this._cache.get(key);
  }
  remove(key) {
    const index = this._cacheKeys.indexOf(key); // O(1)
    if (index > -1) {
      delete this._cache.delete(key);
      this._cacheKeys[index] = this._cacheKeys[this._cache.size];
    }
  }
  clear() {
    this._cache = new Map();
    this._cacheKeys = [];
  }
  _randomReplace(newKey, newValue) {
    const index = Math.floor(Math.random() * this._cache.size);
    this._cache.delete(this._cacheKeys[index]);
    this._cacheKeys[index] = newKey;
    this._cache.set(newKey, newValue);
  }
}
