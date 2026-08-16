import type { ICacheObject, ObjectCacheKey } from './types';
import isStringOrNumber from './util/isStringOrNumber';
import validateCacheSize from './util/validateCacheSize';

export default class LruObjectCache implements ICacheObject {
  private _cache: Record<string, any> = {};
  private _cacheOrdering: ObjectCacheKey[] = [];
  private _cacheSize: number;

  constructor(options: { cacheSize: number }) {
    validateCacheSize(options?.cacheSize);
    this._cacheSize = options.cacheSize;
  }

  set(key: ObjectCacheKey, selectorFn: any): void {
    this._cache[key] = selectorFn;
    this._registerCacheHit(key);

    if (this._cacheOrdering.length > this._cacheSize) {
      const earliest = this._cacheOrdering[0];
      this.remove(earliest);
    }
  }

  get(key: ObjectCacheKey): any {
    this._registerCacheHit(key);
    return this._cache[key];
  }

  remove(key: ObjectCacheKey): void {
    this._deleteCacheHit(key);
    delete this._cache[key];
  }

  clear(): void {
    this._cache = {};
    this._cacheOrdering = [];
  }

  isValidCacheKey(cacheKey: ObjectCacheKey): boolean {
    return isStringOrNumber(cacheKey);
  }

  private _registerCacheHit(key: ObjectCacheKey): void {
    this._deleteCacheHit(key);
    this._cacheOrdering.push(key);
  }

  private _deleteCacheHit(key: ObjectCacheKey): void {
    const index = this._cacheOrdering.indexOf(key);
    if (index > -1) {
      this._cacheOrdering.splice(index, 1);
    }
  }
}
