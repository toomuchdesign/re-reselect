import type { ICacheObject } from '../types';
import validateCacheSize from './util/validateCacheSize.ts';

export default class FifoMapCache implements ICacheObject {
  private _cache = new Map<any, any>();
  private _cacheSize: number;

  constructor(options: { cacheSize: number }) {
    validateCacheSize(options.cacheSize);
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
    return this._cache.get(key);
  }
  remove(key: any) {
    this._cache.delete(key);
  }
  clear() {
    this._cache.clear();
  }
}
