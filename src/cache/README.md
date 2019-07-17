# Re-reselect cache objects

`re-reselect` cache makes use of the [strategy pattern][wiki-strategy-pattern] to provide custom interchangable caching implementations.

## Available cache objects

`re-reselect` ships with **6 ready-to-use cache object constructors**:

|                   name                    | accepted cacheKey |                 type                  |            storage             |
| :---------------------------------------: | :---------------: | :-----------------------------------: | :----------------------------: |
| [`FlatObjectCache`](./FlatObjectCache.js) | `number` `string` |            flat unlimited             |           JS object            |
| [`FifoObjectCache`](./FifoObjectCache.js) | `number` `string` | [first in first out][docs-fifo-cache] |           JS object            |
|  [`LruObjectCache`](./LruObjectCache.js)  | `number` `string` | [least recently used][docs-lru-cache] |           JS object            |
|    [`FlatMapCache`](./FlatMapCache.js)    |        any        |            flat unlimited             | [Map object][docs-mozilla-map] |
|    [`FifoMapCache`](.FifoMapCache.js)     |        any        | [first in first out][docs-fifo-cache] | [Map object][docs-mozilla-map] |
|     [`LruMapCache`](./LruMapCache.js)     |        any        | [least recently used][docs-lru-cache] | [Map object][docs-mozilla-map] |

<!-- prettier-ignore -->
```js
import createCachedSelector, {LruObjectCache, LruMapCache} from 're-reselect';

createCachedSelector(
  // ...
)({
  keySelector,
  cacheObject: new LruObjectCache({cacheSize: 5}),
  // or:
  // cacheObject: new LruMapCache({cacheSize: 5}),
});
```

**[*]ObjectCache** strategy objects treat `cacheKey` of type `number` like strings, since they are used as arguments of JS objects.

**[*]MapCache** strategy objects needs a **Map objects polyfill** in order to use them on non-supporting browsers.

## Write your custom cache object

If none of the provided caching solutions fits your needs you can **write your own cache object!**

Declare a **JS object** adhering to the **following interface** and pass it to `re-reselect` as `options.cacheObject`:

```ts
interface ICacheObject {
  set(key: any, selectorFn: any): void;
  get(key: any): any;
  remove(key: any): void;
  clear(): void;
  isValidCacheKey?(key: any): boolean; // optional
}
```

[docs-strategy-object]: https://sourcemaking.com/design_patterns/strategy
[wiki-strategy-pattern]: https://en.wikipedia.org/wiki/Strategy_pattern
[docs-fifo-cache]: https://en.wikipedia.org/wiki/Cache_replacement_policies#First_In_First_Out_.28FIFO.29
[docs-lru-cache]: https://en.wikipedia.org/wiki/
[docs-mozilla-map]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
