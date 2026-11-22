import type { ICacheObject, ObjectCacheKey } from './types';
import { isStringOrNumber } from './util/isStringOrNumber';
import { validateCacheSize } from './util/validateCacheSize';

export class LruObjectCache implements ICacheObject {
  private _cache: Record<string, any> = Object.create(null);
  private _cacheOrdering: string[] = [];
  private _cacheSize: number;

  constructor(options: { cacheSize: number }) {
    validateCacheSize(options?.cacheSize);
    this._cacheSize = options.cacheSize;
  }

  set(key: ObjectCacheKey, selectorFn: any): void {
    const normalizedKey = String(key);
    this._cache[normalizedKey] = selectorFn;
    this._registerCacheHit(normalizedKey);

    if (this._cacheOrdering.length > this._cacheSize) {
      const earliest = this._cacheOrdering[0];
      this.remove(earliest);
    }
  }

  get(key: ObjectCacheKey): any {
    const normalizedKey = String(key);
    if (normalizedKey in this._cache) {
      this._registerCacheHit(normalizedKey);
    }
    return this._cache[normalizedKey];
  }

  remove(key: ObjectCacheKey): void {
    const normalizedKey = String(key);
    this._deleteCacheHit(normalizedKey);
    delete this._cache[normalizedKey];
  }

  clear(): void {
    this._cache = Object.create(null);
    this._cacheOrdering = [];
  }

  isValidCacheKey(cacheKey: ObjectCacheKey): boolean {
    return isStringOrNumber(cacheKey);
  }

  private _registerCacheHit(key: string): void {
    this._deleteCacheHit(key);
    this._cacheOrdering.push(key);
  }

  private _deleteCacheHit(key: string): void {
    const index = this._cacheOrdering.indexOf(key);
    if (index > -1) {
      this._cacheOrdering.splice(index, 1);
    }
  }
}
