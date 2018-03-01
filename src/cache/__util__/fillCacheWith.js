function fillCacheWith(cache, entries = []) {
  entries.forEach(entry => cache.set(entry, entry));
  return cache;
}

export default fillCacheWith;
