export default class FlatMapCache {
  constructor() {
    this._cache = new Map();
  }
  set(key, selectorFn) {
    this._cache.set(key, selectorFn);
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
}
