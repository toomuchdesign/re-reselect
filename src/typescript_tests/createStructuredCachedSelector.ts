import {createStructuredCachedSelector} from '../index';

function assertType<T>(value: T): T {
  return value;
}

function testCreateStructuredCachedSelector() {
  interface State {
    a: string;
    b: string;
  }
  interface Result {
    x: string;
    y: string;
  }
  interface WrongResult {
    x: string;
    y: number;
  }

  // 1. Infer selector type based on the selector functions.
  const mySelectorA = (state: State) => state.a;
  const mySelectorB = (state: State) => state.b;
  const selector1 = createStructuredCachedSelector({
    x: mySelectorA,
    y: mySelectorB,
  })(state => assertType<string>(state.a));
  assertType<(state: State) => Result>(selector1);
  // @ts-expect-error
  assertType<(state: State) => WrongResult>(selector1);

  // 2. Explicitly set State type for all selector functions
  // => not supported
}

function testParametricCreateStructuredCachedSelector() {
  interface State {
    a: string;
    items: {[key: string]: string};
  }
  interface Result {
    x: string;
    y: string;
  }
  interface WrongResult {
    x: string;
    y: number;
  }

  // 1.1 Infer selector type based on the selector functions. Selectors have the same signature.
  const mySelectorA = (state: State, id: string) => state.a;
  const mySelectorB = (state: State, id: string) => state.items[id];
  const selector1p1 = createStructuredCachedSelector({
    x: mySelectorA,
    y: mySelectorB,
  })((state, id) => assertType<string>(id));
  assertType<(state: State, id: string) => Result>(selector1p1);
  // @ts-expect-error
  assertType<(state: State, id: string) => WrongResult>(selector1p1);

  // 1.2 Infer selector type based on the selector functions. One selector doesn't have a param.
  const mySelectorC = (state: State) => state.a;
  const mySelectorD = (state: State, id: string) => state.items[id];
  const selector1p2 = createStructuredCachedSelector({
    x: mySelectorC,
    y: mySelectorD,
  })((state, id) => assertType<string>(id));
  assertType<(state: State, id: string) => Result>(selector1p2);
  // @ts-expect-error
  assertType<(state: State, id: string) => WrongResult>(selector1p2);

  // 2. Explicitly set State and Parameter types for all selector functions
  // => not supported
}
