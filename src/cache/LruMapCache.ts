import type { ICacheObject } from '../types';
import validateCacheSize from './util/validateCacheSize.ts';

export default class LruMapCache implements ICacheObject {
  private _cache: Record<any, any> = {};
  private _cacheSize: number;

  constructor(options: { cacheSize: number }) {
    validateCacheSize(options.cacheSize);
    this._cache = new Map();
    this._cacheSize = options.cacheSize;
  }
  set(key: any, selectorFn: any) {
    this._cache.set(key, selectorFn);

    if (this._cache.size > this._cacheSize) {
      const earliest = this._cache.keys().next().value;
      this.remove(earliest);
    }
  }
  get(key: any) {
    const value = this._cache.get(key);

    // Register cache hit
    if (this._cache.has(key)) {
      this.remove(key);
      this._cache.set(key, value);
    }
    return value;
  }
  remove(key: any) {
    this._cache.delete(key);
  }
  clear() {
    this._cache.clear();
  }
}
