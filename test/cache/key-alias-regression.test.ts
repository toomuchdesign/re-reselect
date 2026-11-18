import { describe, expect, it } from 'vitest';

import { FifoObjectCache } from '../../src';

describe('object cache key aliases', () => {
  it('preserves FIFO order when an existing key is overwritten', () => {
    const cache = new FifoObjectCache({ cacheSize: 2 });
    cache.set('a', 1);
    cache.set('a', 2);
    cache.set('b', 3);
    expect(cache.get('a')).toBe(2);
    expect(cache.get('b')).toBe(3);
    cache.set('a', 4);
    cache.set('c', 5);
    expect(cache.get('a')).toBeUndefined();
    expect(cache.get('b')).toBe(3);
    expect(cache.get('c')).toBe(5);
  });

  it('treats a numeric key and its string form as one entry', () => {
    const cache = new FifoObjectCache({ cacheSize: 2 });
    cache.set(1, 'old');
    cache.set('1', 'new');
    cache.set(2, 'two');
    expect(cache.get(1)).toBe('new');
    expect(cache.get('2')).toBe('two');
    cache.remove('1');
    cache.set(3, 'three');
    expect(cache.get(2)).toBe('two');
    expect(cache.get(3)).toBe('three');
  });
});
