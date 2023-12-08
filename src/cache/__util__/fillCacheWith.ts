import type {ICacheObject} from '../../index';

function fillCacheWith(
  cache: ICacheObject,
  entries: unknown[] | Set<unknown> = []
) {
  entries.forEach(entry => cache.set(entry, entry));
  return cache;
}

export default fillCacheWith;
