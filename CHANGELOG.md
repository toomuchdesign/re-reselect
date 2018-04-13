# Change log

## 2.0.0

### Breaking Changes

* `cacheKey` values no more restricted by default to `number` or `string`
* `cacheKey` validation delegated to `cacheObject`'s `isValidCacheKey` method
* `selectorCreator` argument removed in favour of `options` object
* `console.warn` when `resolverFunction` returns invalid `cacheKey`
* `cacheObject` export names renamed _(old ones are deprecated)_:
  * `FlatCacheObject` -> `FlatObjectCache`
  * `FifoCacheObject` -> `FifoObjectCache`
  * `LruCacheObject` -> `LruObjectCache`

### New Features

* Added 3 new `cacheObject` implementations using `ES Map` objects accepting any value as `cacheKey`:
  * `FlatMapCache`
  * `FifoMapCache`
  * `LruMapCache`
* Add a `sideEffects: false` flag for Webpack 4

## 1.0.1

* Remove wrong line at the beginning of the docs

## 1.0.0

### Breaking Changes

* `selectorCreator` argument is deprecated in favour of an option object

### New Features

* Accept an option object to provide `cacheObject` and `selectorCreator` options
* Extract caching logic into pluggable/customizable cache objects
* Introduce `Rollup.js` as bundler
* Make compilation cross-platform

## 0.6.3

* Add TS type definition for optional `selectorCreator`

## 0.6.2

* Fix wrong UMD reselect global import

## 0.6.1

* Fix TypeScript `OutputCachedSelector` and `OutputParametricCachedSelector` type definitions

## 0.6.0

* Add TypeScript type definitions

## 0.5.0

* Expose `resultFunc` attribute

## 0.4.0

* Expose `removeMatchingSelector` method
* Expose `clearCache` method

## 0.3.0

* Add UMD dist

## 0.2.0

* Expose `getMatchingSelector` method to retrieve the instance of cached selectors

## 0.1.0

* Allow resolver function to return keys of type number

## 0.0.0

* Initial release
