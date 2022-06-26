import {createSelectorCreator, defaultMemoize} from 'reselect';
import createCachedSelectorAsDefault, {
  createCachedSelector,
  KeySelector,
} from '../index';

function assertType<T>(value: T): T {
  return value;
}

// default export and "createCachedSelector" named export are the same thing
assertType<typeof createCachedSelector>(createCachedSelectorAsDefault);

function testSelector() {
  type State = {foo: string};

  const selector = createCachedSelector(
    (state: State) => state.foo,
    foo => foo
  )((state: State) => state.foo);

  const result: string = selector({foo: 'bar'});
  // @ts-expect-error
  const num: number = selector({foo: 'bar'});

  const recomputations: number = selector.recomputations();
  selector.resetRecomputations();

  // @NOTE selector.dependencies typings still to be implemented
  const dependencies: Array<(state: State) => string> = selector.dependencies;

  const matchingSelectors = selector.getMatchingSelector({foo: 'bar'});
  const matchingSelectorsResultFunc: (foo: string) => string =
    matchingSelectors.resultFunc;

  const resultFunc: (foo: string) => string = selector.resultFunc;

  const keySelector: KeySelector<State> = selector.keySelector;

  // @ts-expect-error
  selector.getMatchingSelector('foo');

  selector.removeMatchingSelector({foo: 'bar'});
  // @ts-expect-error
  selector.removeMatchingSelector('foo');

  selector.clearCache();

  selector.cache;

  // @ts-expect-error
  selector({foo: 'bar'}, {prop: 'value'});

  createCachedSelector(
    (state: {foo: string}) => state.foo,
    (state: {bar: number}) => state.bar,
    (foo, bar) => 1
  )((state: State) => state.foo);
}

function testNestedSelector() {
  type State = {foo: string; bar: number; baz: boolean};

  const selector = createCachedSelector(
    createCachedSelector(
      (state: State) => state.foo,
      (state: State) => state.bar,
      (foo, bar) => ({foo, bar})
    )((state: State) => state.foo),
    (state: State) => state.baz,
    ({foo, bar}, baz) => {
      const foo1: string = foo;
      // @ts-expect-error
      const foo2: number = foo;

      const bar1: number = bar;
      // @ts-expect-error
      const bar2: string = bar;

      const baz1: boolean = baz;
      // @ts-expect-error
      const baz2: string = baz;
    }
  )((state: State) => state.bar);
}

function testInvalidTypeInCombinator() {
  type State = {foo: string; bar: number; baz: boolean};

  createCachedSelector(
    // @ts-expect-error
    (state: State) => state.foo,
    (foo: number) => foo
    // @ts-expect-error
  )((state: State) => foo);

  createCachedSelector(
    (state: State) => state.foo,
    // @ts-expect-error
    state => state.bar,
    // @ts-expect-error
    state => state.baz,
    // @ts-expect-error
    (foo: string, bar: number, baz: boolean, fizz: string) => {}
    // @ts-expect-error
  )((state: State) => foo);
}

function testParametricSelector() {
  type State = {foo: string};
  type Props = {bar: number};

  const selector = createCachedSelector(
    (state: State) => state.foo,
    (state: State, props: Props) => props.bar,
    (foo, bar) => ({foo, bar})
  )((state: State, props: Props) => props.bar);

  const result = selector({foo: 'fizz'}, {bar: 42});
  const foo: string = result.foo;
  const bar: number = result.bar;

  // @ts-expect-error
  selector({foo: 'fizz'});
  // @ts-expect-error
  selector({foo: 'fizz'}, {bar: 'baz'});

  const matchingSelectors = selector.getMatchingSelector(
    {foo: 'fizz'},
    {bar: 42}
  );
  const matchingSelectorsResultFunc: (foo: string, bar: number) => object =
    matchingSelectors.resultFunc;

  // @ts-expect-error
  selector.getMatchingSelector({foo: 'fizz'}, {bar: 'fuzz'});

  selector.removeMatchingSelector({foo: 'fizz'}, {bar: 42});
  // @ts-expect-error
  selector.removeMatchingSelector({foo: 'fizz'});

  selector.clearCache();

  selector.cache;

  const selector2 = createCachedSelector(
    state => state.foo,
    state => state.foo,
    state => state.foo,
    state => state.foo,
    state => state.foo,
    (state: State, props: Props) => props.bar,
    (foo1, foo2, foo3, foo4, foo5, bar) => ({
      foo1,
      foo2,
      foo3,
      foo4,
      foo5,
      bar,
    })
  )((state: State, props: Props) => props.bar);

  selector2({foo: 'fizz'}, {bar: 42});
}

function testArrayArgument() {
  type State = {foo: string};
  const selector = createCachedSelector(
    [
      (state: State) => state.foo,
      (state: State) => state.foo,
      (state: State, props: {bar: number}) => props.bar,
    ],
    (foo1, foo2, bar) => ({foo1, foo2, bar})
  )((state: State, props: {bar: number}) => props.bar);

  const ret = selector({foo: 'fizz'}, {bar: 42});
  const foo1: string = ret.foo1;
  const foo2: string = ret.foo2;
  const bar: number = ret.bar;

  // @ts-expect-error
  createCachedSelector([(state: {foo: string}) => state.foo])(
    // @ts-expect-error
    (state: {foo: string}) => state.foo
  );

  createCachedSelector(
    [(state: {foo: string}) => state.foo, (state: {bar: number}) => state.bar],
    (foo, bar) => {}
  )((state: {foo: string}) => state.foo);

  createCachedSelector(
    [(state: {foo: string}) => state.foo, (state: {foo: string}) => state.foo],
    (foo: string, bar: string) => {}
  )((state: {foo: string}) => state.foo);

  createCachedSelector(
    [
      (state: {foo: string}) => state.foo,
      (state: {foo: string}) => state.foo,
      (state: {foo: string}) => state.foo,
      (state: {foo: string}) => state.foo,
      (state: {foo: string}) => state.foo,
      (state: {foo: string}) => state.foo,
      (state: {foo: string}) => state.foo,
      (state: {foo: string}) => state.foo,
      (state: {foo: string}) => state.foo,
      (state: {foo: string}) => state.foo,
    ],
    (
      foo1: string,
      foo2: string,
      foo3: string,
      foo4: string,
      foo5: string,
      foo6: string,
      foo7: string,
      foo8: string,
      foo9: string,
      foo10: string
    ) => {}
  )((state: {foo: string}) => state.foo);

  createCachedSelector(
    [
      (state: {foo: string}) => state.foo,
      (state: {foo: string}) => state.foo,
      (state: {foo: string}) => state.foo,
      (state: {foo: string}) => state.foo,
      (state: {foo: string}) => state.foo,
      (state: {foo: string}) => state.foo,
      (state: {foo: string}) => state.foo,
      (state: {foo: string}) => state.foo,
      (state: {foo: string}) => state.foo,
      // @ts-expect-error
      (state: {bar: number}) => state.bar,
    ],
    (foo1, foo2, foo3, foo4, foo5, foo6, foo7, foo8: number, foo9, bar) => {}
    // @ts-expect-error
  )((state: {foo: string}) => state.foo);

  createCachedSelector(
    [
      // @ts-expect-error
      (state: {foo: string}) => state.foo,
      // @ts-expect-error
      state => state.foo,
      // @ts-expect-error
      state => state.foo,
      // @ts-expect-error
      state => state.foo,
      // @ts-expect-error
      state => state.foo,
      // @ts-expect-error
      state => state.foo,
      // @ts-expect-error
      state => state.foo,
      // @ts-expect-error
      state => state.foo,
      // @ts-expect-error
      1,
    ],
    // @ts-expect-error
    (foo1, foo2, foo3, foo4, foo5, foo6, foo7, foo8, foo9) => {}
    // @ts-expect-error
  )(state => state.foo);

  const selector2 = createCachedSelector(
    [
      (state: {foo: string}) => state.foo,
      (state: {foo: string}) => state.foo,
      (state: {foo: string}) => state.foo,
      (state: {foo: string}) => state.foo,
      (state: {foo: string}) => state.foo,
      (state: {foo: string}) => state.foo,
      (state: {foo: string}) => state.foo,
      (state: {foo: string}) => state.foo,
      (state: {foo: string}) => state.foo,
    ],
    (
      foo1: string,
      foo2: string,
      foo3: string,
      foo4: string,
      foo5: string,
      foo6: string,
      foo7: string,
      foo8: string,
      foo9: string
    ) => {
      return {foo1, foo2, foo3, foo4, foo5, foo6, foo7, foo8, foo9};
    }
  )((state: {foo: string}) => state.foo);

  {
    const ret = selector2({foo: 'fizz'});
    const foo1: string = ret.foo1;
    const foo2: string = ret.foo2;
    const foo3: string = ret.foo3;
    const foo4: string = ret.foo4;
    const foo5: string = ret.foo5;
    const foo6: string = ret.foo6;
    const foo7: string = ret.foo7;
    const foo8: string = ret.foo8;
    const foo9: string = ret.foo9;
    // @ts-expect-error
    ret.foo10;
  }

  // @ts-expect-error
  selector2({foo: 'fizz'}, {bar: 42});

  const parametric = createCachedSelector(
    [
      (state: {foo: string}, props: {bar: number}) => props.bar,
      (state: {foo: string}) => state.foo,
      (state: {foo: string}) => state.foo,
      (state: {foo: string}) => state.foo,
      (state: {foo: string}) => state.foo,
      (state: {foo: string}) => state.foo,
      (state: {foo: string}) => state.foo,
      (state: {foo: string}) => state.foo,
      (state: {foo: string}) => state.foo,
    ],
    (
      bar: number,
      foo1: string,
      foo2: string,
      foo3: string,
      foo4: string,
      foo5: string,
      foo6: string,
      foo7: string,
      foo8: string
    ) => {
      return {foo1, foo2, foo3, foo4, foo5, foo6, foo7, foo8, bar};
    }
  )((state: any, props: {bar: number}) => props.bar);

  // @ts-expect-error
  parametric({foo: 'fizz'});

  {
    const ret = parametric({foo: 'fizz'}, {bar: 42});
    const foo1: string = ret.foo1;
    const foo2: string = ret.foo2;
    const foo3: string = ret.foo3;
    const foo4: string = ret.foo4;
    const foo5: string = ret.foo5;
    const foo6: string = ret.foo6;
    const foo7: string = ret.foo7;
    const foo8: string = ret.foo8;
    const bar: number = ret.bar;
    // @ts-expect-error
    ret.foo9;
  }
}

function testKeySelectorOption() {
  type State = {foo: string; obj: {bar: string}};

  const selector = createCachedSelector(
    (state: State) => state.foo,
    (state: State, arg1: number) => arg1,
    (state: State, arg1: number, arg2: number) => arg1 + arg2,
    (foo, arg1, sum) => ({foo, arg1, sum})
  )((state: State, arg1: number, arg2: number) => arg1 + arg2);

  selector({foo: 'fizz', obj: {bar: 'bar'}}, 1, 2);

  const selector2 = createCachedSelector(
    (state: State) => state.obj,
    obj => obj
  )({
    keySelector: (state: State, obj) => obj,
  });
}

function testKeySelectorCreatorOption() {
  type State = {foo: string};
  const state = {foo: 'bar'};
  const inputSelector = (state: State) => state.foo;
  const resultFunc = (input: string) => input;
  const keySelector = (state: State) => state.foo;

  const selector = createCachedSelector(
    inputSelector,
    inputSelector,
    resultFunc
  )({
    keySelector,
    keySelectorCreator: ({inputSelectors, resultFunc, keySelector}) => {
      const input1 = inputSelectors[0](state);
      const input2 = inputSelectors[1](state);
      // @ts-expect-error
      inputSelectors[2];

      const result: string = resultFunc(input1, input2);
      return keySelector;
    },
  });

  const result: string = selector(state);
}

function testSelectorCreatorOption() {
  type State = {foo: string};

  const selector2 = createCachedSelector(
    (state: State) => state.foo,
    foo => foo
  )({
    keySelector: (state: State) => state.foo,
    selectorCreator: createSelectorCreator(defaultMemoize),
  });
}

function testSelectorCreatorOptionNonDefaultMemoize() {
  type State = {foo: string};

  const selector2 = createCachedSelector(
    (state: State) => state.foo,
    foo => foo
  )({
    keySelector: (state: State) => state.foo,
    selectorCreator: createSelectorCreator((func) => func),
  });
}
