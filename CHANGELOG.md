# Change log

## 3.4.0

### New Features

- Introduce single argument signature

## 3.3.0

### New Features

- Add `keySelectorCreator` option

## 3.2.0

### New Features

- Add `createStructuredCachedSelector`

## 3.1.0

### New Features

- Expose `keySelector` property

## 3.0.0

### Breaking Changes

- Update TypeScript typings
  - Introduce typings for heterogeneous selectors
  - Introduce typings for any number of uniform selectors
  - Rename "resolver" as "keySelector"

### New Features

- Update TypeScript typings
  - Introduce typings for `dependencies` property

## 2.3.0

### New Features

- Do not include test files on publish
- Introduce new selectors' methods/properties:
  - `dependencies` property
  - `recomputations` method
  - `resetRecomputations` method

## 2.2.0

- Fix cache object's `isValidCacheKey` method TS type definition

### New Features

- Upgrade to babel 7
- Update dev dependencies

### Breaking Changes (not considered worth a major release)

`Babel 7` in `loose` mode [doesn't add anymore `classCallCheck` utility to transpiled ES classes](https://babeljs.io/blog/2018/08/27/7.0.0#output-options). Cache object classes instantiated by mistake without new operator will now fail silently.

## 2.1.0

### New Features

- Expose `cache` property

## 2.0.0

### Breaking Changes

- `cacheKey` values no more restricted by default to `number` or `string`
- `cacheKey` validation delegated to `cacheObject`'s `isValidCacheKey` method
- `selectorCreator` argument removed in favour of `options` object
- `console.warn` when `resolverFunction` returns invalid `cacheKey`
- `cacheObject` export names renamed _(old ones are deprecated)_:
  - `FlatCacheObject` -> `FlatObjectCache`
  - `FifoCacheObject` -> `FifoObjectCache`
  - `LruCacheObject` -> `LruObjectCache`

### New Features

- Added 3 new `cacheObject` implementations using `ES Map` objects accepting any value as `cacheKey`:
  - `FlatMapCache`
  - `FifoMapCache`
  - `LruMapCache`
- Add a `sideEffects: false` flag for Webpack 4

## 1.0.1

- Remove wrong line at the beginning of the docs

## 1.0.0

### Breaking Changes

- `selectorCreator` argument is deprecated in favour of an option object

### New Features

- Accept an option object to provide `cacheObject` and `selectorCreator` options
- Extract caching logic into pluggable/customizable cache objects
- Introduce `Rollup.js` as bundler
- Make compilation cross-platform

## 0.6.3

- Add TS type definition for optional `selectorCreator`

## 0.6.2

- Fix wrong UMD reselect global import

## 0.6.1

- Fix TypeScript `OutputCachedSelector` and `OutputParametricCachedSelector` type definitions

## 0.6.0

- Add TypeScript type definitions

## 0.5.0

- Expose `resultFunc` attribute

## 0.4.0

- Expose `removeMatchingSelector` method
- Expose `clearCache` method

## 0.3.0

- Add UMD dist

## 0.2.0

- Expose `getMatchingSelector` method to retrieve the instance of cached selectors

## 0.1.0

- Allow resolver function to return keys of type number

## 0.0.0

- Initial release
