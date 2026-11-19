import type { ICacheObject, ObjectCacheKey } from './types';
import { isStringOrNumber } from './util/isStringOrNumber';
import { validateCacheSize } from './util/validateCacheSize';

export class FifoObjectCache implements ICacheObject {
  private _cache: Record<string, any> = Object.create(null);
  private _cacheOrdering: string[] = [];
  private _cacheSize: number;

  constructor(options: { cacheSize: number }) {
    validateCacheSize(options?.cacheSize);
    this._cacheSize = options.cacheSize;
  }

  set(key: ObjectCacheKey, selectorFn: any): void {
    const normalizedKey = String(key);
    if (!(normalizedKey in this._cache)) {
      this._cacheOrdering.push(normalizedKey);
    }
    this._cache[key] = selectorFn;

    if (this._cacheOrdering.length > this._cacheSize) {
      const earliest = this._cacheOrdering[0];
      this.remove(earliest);
    }
  }

  get(key: ObjectCacheKey): any {
    return this._cache[key];
  }

  remove(key: ObjectCacheKey): void {
    const index = this._cacheOrdering.indexOf(String(key));

    if (index > -1) {
      this._cacheOrdering.splice(index, 1);
    }
    delete this._cache[key];
  }

  clear(): void {
    this._cache = Object.create(null);
    this._cacheOrdering = [];
  }

  isValidCacheKey(cacheKey: ObjectCacheKey): boolean {
    return isStringOrNumber(cacheKey);
  }
}
