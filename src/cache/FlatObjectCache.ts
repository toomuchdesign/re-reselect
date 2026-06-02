import type { ICacheObject, ObjectCacheKey } from './types';
import isStringOrNumber from './util/isStringOrNumber';

export default class FlatObjectCache implements ICacheObject {
  private _cache: Record<string, any> = {};

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
    this._cache = {};
  }

  isValidCacheKey(cacheKey: ObjectCacheKey): boolean {
    return isStringOrNumber(cacheKey);
  }
}
