import type { ICacheObject } from './types';
import validateCacheSize from './util/validateCacheSize';

export default class FifoMapCache implements ICacheObject {
  private _cache: Map<any, any> = new Map();
  private _cacheSize: number;

  constructor(options: { cacheSize: number }) {
    const { cacheSize } = options ?? ({} as { cacheSize: number });
    validateCacheSize(cacheSize);
    this._cacheSize = cacheSize;
  }

  set(key: any, selectorFn: any): void {
    this._cache.set(key, selectorFn);

    if (this._cache.size > this._cacheSize) {
      const earliest = this._cache.keys().next().value;
      this.remove(earliest);
    }
  }

  get(key: any): any {
    return this._cache.get(key);
  }

  remove(key: any): void {
    this._cache.delete(key);
  }

  clear(): void {
    this._cache.clear();
  }
}
