import validateCacheSize from './util/validateCacheSize';
import isStringOrNumber from './util/isStringOrNumber';

export default class LruObjectCache {
  constructor({cacheSize} = {}) {
    validateCacheSize(cacheSize);
    this._cache = {};
    this._cacheOrdering = [];
    this._cacheSize = cacheSize;
  }
  set(key, selectorFn) {
    this._cache[key] = selectorFn;
    this._registerCacheHit(key);

    if (this._cacheOrdering.length > this._cacheSize) {
      const earliest = this._cacheOrdering[0];
      this.remove(earliest);
    }
  }
  get(key) {
    this._registerCacheHit(key);
    return this._cache[key];
  }
  remove(key) {
    this._deleteCacheHit(key);
    delete this._cache[key];
  }
  clear() {
    this._cache = {};
    this._cacheOrdering = [];
  }
  _registerCacheHit(key) {
    this._deleteCacheHit(key);
    this._cacheOrdering.push(key);
  }
  _deleteCacheHit(key) {
    const index = this._cacheOrdering.indexOf(key);
    if (index > -1) {
      this._cacheOrdering.splice(index, 1);
    }
  }
  isValidCacheKey(cacheKey) {
    return isStringOrNumber(cacheKey);
  }
}
