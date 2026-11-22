---
're-reselect': patch
---

Normalize `LruObjectCache` and `FifoObjectCache` keys to strings once per public method, so the cache and its ordering always use the same key.
