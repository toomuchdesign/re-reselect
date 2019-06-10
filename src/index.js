import createCachedSelector from './createCachedSelector';
export default createCachedSelector;

export {
  default as createStructuredCachedSelector,
} from './createStructuredCachedSelector';

// Cache objects
export {default as FlatObjectCache} from './cache/FlatObjectCache';
export {default as FifoObjectCache} from './cache/FifoObjectCache';
export {default as LruObjectCache} from './cache/LruObjectCache';
export {default as FlatMapCache} from './cache/FlatMapCache';
export {default as FifoMapCache} from './cache/FifoMapCache';
export {default as LruMapCache} from './cache/LruMapCache';

// Deprecated cache objects exports
// @TODO remove in next major release
export {default as FlatCacheObject} from './cache/FlatObjectCache';
export {default as FifoCacheObject} from './cache/FifoObjectCache';
export {default as LruCacheObject} from './cache/LruMapCache';
