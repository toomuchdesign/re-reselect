import type { ICacheObject } from '../types';
import isStringOrNumber from './util/isStringOrNumber.ts';
import validateCacheSize from './util/validateCacheSize.ts';

export default class FifoObjectCache implements ICacheObject {
  private _cache: Record<any, any> = {};
  private _cacheOrdering: any[] = [];
  private _cacheSize: number;

  constructor(options: { cacheSize: number }) {
    validateCacheSize(options.cacheSize);
    this._cacheSize = options.cacheSize;
  }
  set(key: any, selectorFn: any) {
    this._cache[key] = selectorFn;
    this._cacheOrdering.push(key);

    if (this._cacheOrdering.length > this._cacheSize) {
      const earliest = this._cacheOrdering[0];
      this.remove(earliest);
    }
  }
  get(key: any) {
    return this._cache[key];
  }
  remove(key: any) {
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
  isValidCacheKey(cacheKey: any) {
    return isStringOrNumber(cacheKey);
  }
}
