import {createStructuredCachedSelector} from '../src/index';

function testCreateStructuredCachedSelector() {
  type State = {a: string; b: string};
  type Result = {x: string; y: string};
  type WrongResult = {x: string; y: number};

  const mySelectorA = (state: State) => state.a;
  const mySelectorB = (state: State) => state.b;

  const selector = createStructuredCachedSelector({
    x: mySelectorA,
    y: mySelectorB,
  })((state: State) => state.a);

  const state: State = {a: 'foo', b: 'bar'};
  const result: Result = selector(state);
  // typings:expect-error
  const wrongResult: WrongResult = selector(state);
}

function testParametricCreateStructuredCachedSelector() {
  type State = {a: string; items: {[key: string]: string}};
  type Result = {x: string; y: string};
  type WrongResult = {x: string; y: number};

  const mySelectorA = (state: State, id: string) => state.a;
  const mySelectorB = (state: State, id: string) => state.items[id];

  const selector = createStructuredCachedSelector({
    x: mySelectorA,
    y: mySelectorB,
  })((state: State, id: string) => id);

  const selectorWithGenerics = createStructuredCachedSelector<
    {x: typeof mySelectorA; y: typeof mySelectorB},
    State,
    string
  >({
    x: mySelectorA,
    y: mySelectorB,
  })((state: State) => state.a);

  const state: State = {a: 'foo', items: {foo: 'foo', bar: 'bar'}};
  const result: Result = selector(state, 'foo');
  const resultG: Result = selectorWithGenerics(state, 'foo');
  // typings:expect-error
  const wrongResult: WrongResult = selector(state, 'foo');
}
