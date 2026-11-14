import type { ICacheObject, ObjectCacheKey } from './types';
import { isStringOrNumber } from './util/isStringOrNumber';

export class FlatObjectCache implements ICacheObject {
  private _cache: Record<string, any> = Object.create(null);

  set(key: ObjectCacheKey, selectorFn: any): void {
    this._cache[key] = selectorFn;
  }

  get(key: ObjectCacheKey): any {
    return this._cache[key];
  }

  remove(key: ObjectCacheKey): void {
    delete this._cache[key];
  }

  clear(): void {
    this._cache = Object.create(null);
  }

  isValidCacheKey(cacheKey: ObjectCacheKey): boolean {
    return isStringOrNumber(cacheKey);
  }
}
