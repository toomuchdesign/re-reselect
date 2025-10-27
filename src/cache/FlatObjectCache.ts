import type { ICacheObject } from '../types';
import isStringOrNumber from './util/isStringOrNumber.ts';

export default class FlatObjectCache implements ICacheObject {
  private _cache: Record<any, any> = {};

  set(key: any, selectorFn: any) {
    this._cache[key] = selectorFn;
  }
  get(key: any) {
    return this._cache[key];
  }
  remove(key: any) {
    delete this._cache[key];
  }
  clear() {
    this._cache = {};
  }
  isValidCacheKey(cacheKey: any) {
    return isStringOrNumber(cacheKey);
  }
}
