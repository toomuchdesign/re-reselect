import type { ICacheObject } from '../types';

export class FlatMapCache implements ICacheObject {
  private _cache = new Map<any, any>();

  constructor() {}
  set(key: any, selectorFn: any) {
    this._cache.set(key, selectorFn);
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
