import {
  createCachedSelector,
  FlatObjectCache,
  FifoObjectCache,
  LruObjectCache,
  FlatMapCache,
  FifoMapCache,
  LruMapCache,
} from '../index';

type State = {foo: string};
const fooSelector = (state: State) => state.foo;
const combinerSelector = (foo: string) => foo;

function testFlatObjectCache() {
  // Accepts this cache object as an option
  createCachedSelector(
    fooSelector,
    combinerSelector
  )({
    keySelector: fooSelector,
    cacheObject: new FlatObjectCache(),
  });

  // Exposes the interface
  const cacheObject = new FlatObjectCache();
  cacheObject.set('foo', () => {});
  cacheObject.set(1, () => {});
  // @ts-expect-error
  cacheObject.set({}, () => {});
  const result1: any = cacheObject.get('foo');
  const result2: any = cacheObject.get(2);
  cacheObject.remove('foo');
  cacheObject.remove(1);
  cacheObject.clear();

  cacheObject.isValidCacheKey(1);
}

function testFifoObjectCache() {
  // Accepts this cache object as an option
  createCachedSelector(
    fooSelector,
    combinerSelector
  )({
    keySelector: fooSelector,
    cacheObject: new FifoObjectCache({cacheSize: 10}),
  });

  // @ts-expect-error
  new FifoObjectCache();

  // Exposes the interface
  const cacheObject = new FifoObjectCache({cacheSize: 10});
  cacheObject.set('foo', () => {});
  cacheObject.set(1, () => {});
  // @ts-expect-error
  cacheObject.set({}, () => {});
  const result1: any = cacheObject.get('foo');
  const result2: any = cacheObject.get(2);
  cacheObject.remove('foo');
  cacheObject.remove(1);
  cacheObject.clear();

  cacheObject.isValidCacheKey(1);
}

function testLruObjectCache() {
  // Accepts this cache object as an option
  createCachedSelector(
    fooSelector,
    combinerSelector
  )({
    keySelector: fooSelector,
    cacheObject: new LruObjectCache({cacheSize: 10}),
  });

  // @ts-expect-error
  new LruObjectCache();

  // Exposes the interface
  const cacheObject = new LruObjectCache({cacheSize: 10});
  cacheObject.set('foo', () => {});
  cacheObject.set(1, () => {});
  // @ts-expect-error
  cacheObject.set({}, () => {});
  const result1: any = cacheObject.get('foo');
  const result2: any = cacheObject.get(2);
  cacheObject.remove('foo');
  cacheObject.remove(1);
  cacheObject.clear();

  cacheObject.isValidCacheKey(1);
}

function testFlatMapCache() {
  // Accepts this cache object as an option
  createCachedSelector(
    fooSelector,
    combinerSelector
  )({
    keySelector: fooSelector,
    cacheObject: new FlatMapCache(),
  });

  // Exposes the interface
  const cacheObject = new FlatMapCache();
  cacheObject.set('foo', () => {});
  cacheObject.set(1, () => {});
  cacheObject.set({}, () => {});
  const result1: any = cacheObject.get('foo');
  const result2: any = cacheObject.get(2);
  const result3: any = cacheObject.get({});
  cacheObject.remove('foo');
  cacheObject.remove(1);
  cacheObject.remove({});
  cacheObject.clear();
}

function testFifoMapCache() {
  // Accepts this cache object as an option
  createCachedSelector(
    fooSelector,
    combinerSelector
  )({
    keySelector: fooSelector,
    cacheObject: new FifoMapCache({cacheSize: 10}),
  });

  // @ts-expect-error
  new FifoMapCache();

  // Exposes the interface
  const cacheObject = new FifoMapCache({cacheSize: 10});
  cacheObject.set('foo', () => {});
  cacheObject.set(1, () => {});
  cacheObject.set({}, () => {});
  const result1: any = cacheObject.get('foo');
  const result2: any = cacheObject.get(2);
  const result3: any = cacheObject.get({});
  cacheObject.remove('foo');
  cacheObject.remove(1);
  cacheObject.remove({});
  cacheObject.clear();
}

function testLruMapCache() {
  // Accepts this cache object as an option
  createCachedSelector(
    fooSelector,
    combinerSelector
  )({
    keySelector: fooSelector,
    cacheObject: new LruMapCache({cacheSize: 10}),
  });

  // @ts-expect-error
  new LruMapCache();

  // Exposes the interface
  const cacheObject = new LruMapCache({cacheSize: 10});
  cacheObject.set('foo', () => {});
  cacheObject.set(1, () => {});
  cacheObject.set({}, () => {});
  const result1: any = cacheObject.get('foo');
  const result2: any = cacheObject.get(2);
  const result3: any = cacheObject.get({});
  cacheObject.remove('foo');
  cacheObject.remove(1);
  cacheObject.remove({});
  cacheObject.clear();
}
