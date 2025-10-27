import type { ICacheObject } from '../types';
import isStringOrNumber from './util/isStringOrNumber.ts';
import validateCacheSize from './util/validateCacheSize.ts';

export default class LruObjectCache implements ICacheObject {
  private _cache: Record<any, any> = {};
  private _cacheOrdering: any[] = [];
  private _cacheSize: number;

  constructor(options: { cacheSize: number }) {
    validateCacheSize(options.cacheSize);
    this._cache = {};
    this._cacheOrdering = [];
    this._cacheSize = options.cacheSize;
  }
  set(key: any, selectorFn: any) {
    this._cache[key] = selectorFn;
    this._registerCacheHit(key);

    if (this._cacheOrdering.length > this._cacheSize) {
      const earliest = this._cacheOrdering[0];
      this.remove(earliest);
    }
  }
  get(key: any) {
    this._registerCacheHit(key);
    return this._cache[key];
  }
  remove(key: any) {
    this._deleteCacheHit(key);
    delete this._cache[key];
  }
  clear() {
    this._cache = {};
    this._cacheOrdering = [];
  }
  _registerCacheHit(key: any) {
    this._deleteCacheHit(key);
    this._cacheOrdering.push(key);
  }
  _deleteCacheHit(key: any) {
    const index = this._cacheOrdering.indexOf(key);
    if (index > -1) {
      this._cacheOrdering.splice(index, 1);
    }
  }
  isValidCacheKey(cacheKey: any) {
    return isStringOrNumber(cacheKey);
  }
}
