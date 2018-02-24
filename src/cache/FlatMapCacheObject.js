export default class FlatMapCacheObject {
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
    delete this._cache.delete(key);
  }
  clear() {
    this._cache.clear();
  }
  isCacheKeyValid() {
    return true;
  }
}
