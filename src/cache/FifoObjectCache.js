import validateCacheSize from './util/validateCacheSize';
import isStringOrNumber from './util/isStringOrNumber';

export default class FifoObjectCache {
  constructor({cacheSize} = {}) {
    validateCacheSize(cacheSize);
    this._cache = {};
    this._cacheOrdering = [];
    this._cacheSize = cacheSize;
  }
  set(key, selectorFn) {
    this._cache[key] = selectorFn;
    this._cacheOrdering.push(key);

    if (this._cacheOrdering.length > this._cacheSize) {
      const earliest = this._cacheOrdering[0];
      this.remove(earliest);
    }
  }
  get(key) {
    return this._cache[key];
  }
  remove(key) {
    const index = this._cacheOrdering.indexOf(key);

    if (index > -1) {
      this._cacheOrdering.splice(index, 1);
    }
    delete this._cache[key];
  }
  clear() {
    this._cache = {};
    this._cacheOrdering = [];
  }
  isValidCacheKey(cacheKey) {
    return isStringOrNumber(cacheKey);
  }
}
