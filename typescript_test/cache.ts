import createCachedSelector,{
  FlatCacheObject,
  FifoCacheObject,
  LruCacheObject,
  FlatMapCacheObject,
  FifoMapCacheObject,
  LruMapCacheObject,
} from '../src/index';

type State = {foo: string};
const fooSelector = (state: State) => state.foo;
const combinerSelector = (foo: string) => foo;

function testFlatCacheObject () {
  // Accepts this cache object as an option
  createCachedSelector(
    fooSelector,
    combinerSelector,
  )(
    fooSelector, {
      cacheObject: new FlatCacheObject()
    }
  );

  // Exposes the interface
  const cacheObject = new FlatCacheObject();
  cacheObject.set('foo', () => {});
  cacheObject.set(1, () => {});
  // typings:expect-error
  cacheObject.set({}, () => {});
  const result1: any = cacheObject.get('foo');
  const result2: any = cacheObject.get(2);
  cacheObject.remove('foo');
  cacheObject.remove(1);
  cacheObject.clear();
}

function testFifoCacheObject () {
  // Accepts this cache object as an option
  createCachedSelector(
    fooSelector,
    combinerSelector,
  )(
    fooSelector, {
      cacheObject: new FifoCacheObject({ cacheSize: 10 })
    }
  );

  // typings:expect-error
  new FifoCacheObject();

  // Exposes the interface
  const cacheObject = new FifoCacheObject({ cacheSize: 10 });
  cacheObject.set('foo', () => {});
  cacheObject.set(1, () => {});
  // typings:expect-error
  cacheObject.set({}, () => {});
  const result1: any = cacheObject.get('foo');
  const result2: any = cacheObject.get(2);
  cacheObject.remove('foo');
  cacheObject.remove(1);
  cacheObject.clear();
}

function testLruCacheObject () {
  // Accepts this cache object as an option
  createCachedSelector(
    fooSelector,
    combinerSelector,
  )(
    fooSelector, {
      cacheObject: new LruCacheObject({ cacheSize: 10 })
    }
  );

  // typings:expect-error
  new LruCacheObject();

  // Exposes the interface
  const cacheObject = new LruCacheObject({ cacheSize: 10 });
  cacheObject.set('foo', () => {});
  cacheObject.set(1, () => {});
  // typings:expect-error
  cacheObject.set({}, () => {});
  const result1: any = cacheObject.get('foo');
  const result2: any = cacheObject.get(2);
  cacheObject.remove('foo');
  cacheObject.remove(1);
  cacheObject.clear();
}

function testFlatMapCacheObject () {
  // Accepts this cache object as an option
  createCachedSelector(
    fooSelector,
    combinerSelector,
  )(
    fooSelector, {
      cacheObject: new FlatMapCacheObject()
    }
  );

  // Exposes the interface
  const cacheObject = new FlatMapCacheObject();
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

function testFifoMapCacheObject () {
  // Accepts this cache object as an option
  createCachedSelector(
    fooSelector,
    combinerSelector,
  )(
    fooSelector, {
      cacheObject: new FifoMapCacheObject({ cacheSize: 10 })
    }
  );

  // typings:expect-error
  new FifoMapCacheObject();

  // Exposes the interface
  const cacheObject = new FifoMapCacheObject({ cacheSize: 10 });
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


function testLruMapCacheObject () {
  // Accepts this cache object as an option
  createCachedSelector(
    fooSelector,
    combinerSelector,
  )(
    fooSelector, {
      cacheObject: new LruMapCacheObject({ cacheSize: 10 })
    }
  );

  // typings:expect-error
  new LruMapCacheObject();

  // Exposes the interface
  const cacheObject = new LruMapCacheObject({ cacheSize: 10 });
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
