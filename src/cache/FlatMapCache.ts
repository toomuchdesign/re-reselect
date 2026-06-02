import type { ICacheObject } from './types';

export default class FlatMapCache implements ICacheObject {
  private _cache: Map<any, any> = new Map();

  set(key: any, selectorFn: any): void {
    this._cache.set(key, selectorFn);
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
