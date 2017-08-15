import { createSelector } from 'reselect';

// @TODO Move it into a separate file and test it
export class FlatCacheObject {
  constructor() {
    this._cache = {};
  }
  set(key, selectorFn) {
    this._cache[key] = selectorFn;
  }
  get(key) {
    return this._cache[key];
  }
  remove(key) {
    delete this._cache[key];
  }
  clear() {
    this._cache = {};
  }
}

export class FifoCacheObject {
  constructor({ cacheSize } = {}) {
    if (cacheSize === undefined) {
      throw new Error('Missing the required property `cacheSize`.');
    }
    if (!Number.isInteger(cacheSize) || cacheSize <= 0) {
      throw new Error('The `cacheSize` property must be a positive integer value.');
    }
    this._cache = {};
    this._cacheOrdering = [];
    this._cacheSize = cacheSize;
  }
  set(key, selectorFn) {
    this._cache[key] = selectorFn;
    this._cacheOrdering.push(key);

    if (this._cacheOrdering.length > this._cacheSize) {
      const earliest = this._cacheOrdering.shift();
      delete this._cache[earliest];
    }
  }
  get(key) {
    return this._cache[key];
  }
  remove(key) {
    const index = this._cacheOrdering.indexOf(key);

    if (index > -1) {
      this._cacheOrdering.splice(index, 1);
      delete this._cache[key];
    }
  }
  clear() {
    this._cache = {};
    this._cacheOrdering = [];
  }
}

export class LruCacheObject {
  constructor ({ cacheSize } = {}) {
    if (cacheSize === undefined) {
      throw new Error('Missing the required property `cacheSize`.');
    }
    if (!Number.isInteger(cacheSize) || cacheSize <= 0) {
      throw new Error('The `cacheSize` property must be a positive integer value.');
    }
    this._cache = {};
    this._cacheOrdering = [];
    this._cacheSize = cacheSize;
  }
  set(key, selectorFn) {
    this._cache[key] = selectorFn;
    this._registerCacheHit(key);
    if (this._cacheOrdering.length > this._cacheSize) {
        const earliest = this._cacheOrdering.shift();
        delete this._cache[earliest];
    }
  }
  get(key) {
    this._registerCacheHit(key);
    return this._cache[key];
  }
  remove(key) {
    delete this._cache[key];
  }
  clear() {
    this._cache = {};
    this._cacheOrdering = [];
  }
  _registerCacheHit(key) {
    const index = this._cacheOrdering.indexOf(key);
    if (index !== -1) {
        this._cacheOrdering.splice(index, 1);
    }
    this._cacheOrdering.push(key);
  }
}

export default function createCachedSelector(...funcs) {
  const defaultCacheCreator = FlatCacheObject;

  return (resolver, options = {}) => {
    let cache;
    let selectorCreator;

    // Allow "options" to be provided as a "selectorCreator" for backward compatibility
    // @TODO Remove "options" as a function in next breaking release
    if(typeof options === 'function') {
      cache = new defaultCacheCreator();
      selectorCreator = options;
    } else {
      cache = options.cacheObject || new defaultCacheCreator();
      selectorCreator = options.selectorCreator || createSelector;
    }

    const selector = function(...args) {
      // Application receives this function
      const cacheKey = resolver(...args);

      if (typeof cacheKey === 'string' || typeof cacheKey === 'number') {
        let cacheResult = cache.get(cacheKey);

        if (cacheResult === undefined) {
          cache.set(cacheKey, selectorCreator(...funcs));
          cacheResult = cache.get(cacheKey);
        }

        return cacheResult(...args);
      }
      return undefined;
    };

    // Further selector methods
    selector.getMatchingSelector = (...args) => {
      const cacheKey = resolver(...args);
      // @NOTE It might update cache hit count in LRU-like caches
      return cache.get(cacheKey);
    };

    selector.removeMatchingSelector = (...args) => {
      const cacheKey = resolver(...args);
      cache.remove(cacheKey);
    };

    selector.clearCache = () => {
      cache.clear();
    };

    selector.resultFunc = funcs[funcs.length -1];

    return selector;
  }
}
