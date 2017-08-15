export default class FlatCacheObject {
  constructor() {
    this._cache = {};
  }
  set(key, selectorFn) {
    this._cache[key] = selectorFn;
  }
  get(key) {
    return this._cache[key];
  }
  remove(key) {
    delete this._cache[key];
  }
  clear() {
    this._cache = {};
  }
}
