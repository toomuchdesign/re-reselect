import createCachedSelector from '../index';

function testSelector() {
  type State = {foo: string};

  const selector = createCachedSelector(
    (state: State) => state.foo,
    (foo) => foo,
  )(
    (state: State) => state.foo,
  );

  selector.getMatchingSelector({foo: 'bar'});
  selector.removeMatchingSelector({foo: 'bar'});
  selector.clearCache();
  const res = selector.resultFunc('test');

  const foo: string = selector({foo: 'bar'});

  // typings:expect-error
  selector({foo: 'bar'}, {prop: 'value'});

  // typings:expect-error
  const num: number = selector({foo: 'bar'});

  // typings:expect-error
  createCachedSelector(
    (state: {foo: string}) => state.foo,
    (state: {bar: number}) => state.bar,
    (foo, bar) => 1
  )(
    (state: State) => state.foo,
  );
}

function testNestedSelector() {
  type State = {foo: string, bar: number, baz: boolean};

  const selector = createCachedSelector(
    createCachedSelector(
      (state: State) => state.foo,
      (state: State) => state.bar,
      (foo, bar) => ({foo, bar}),
    )(
      (state: State) => state.foo,
    ),
    (state: State) => state.baz,
    ({foo, bar}, baz) => {
      const foo1: string = foo;
      // typings:expect-error
      const foo2: number = foo;

      const bar1: number = bar;
      // typings:expect-error
      const bar2: string = bar;

      const baz1: boolean = baz;
      // typings:expect-error
      const baz2: string = baz;
    },
  )(
    (state: State) => state.bar,
  )
}

function testInvalidTypeInCombinator() {
  type State = {foo: string, bar: number, baz: boolean};

  // typings:expect-error
  createCachedSelector(
    (state: State) => state.foo,
    (foo: number) => foo,
  )(
    (state: State) => foo,
  );

  // typings:expect-error
  createCachedSelector(
    (state: State) => state.foo,
    state => state.bar,
    state => state.baz,
    (foo: string, bar: number, baz: boolean, fizz: string) => {}
  )(
    (state: State) => foo,
  );
}

function testParametricSelector() {
  type State = {foo: string;};
  type Props = {bar: number};

  const selector = createCachedSelector(
    (state: State) => state.foo,
    (state: never, props: Props) => props.bar,
    (foo, bar) => ({foo, bar}),
  )(
    (state: never, props: Props) => props.bar,
  );

  // typings:expect-error
  selector({foo: 'fizz'});
  // typings:expect-error
  selector({foo: 'fizz'}, {bar: 'baz'});

  const ret = selector({foo: 'fizz'}, {bar: 42});
  const foo: string = ret.foo;
  const bar: number = ret.bar;

  const selector2 = createCachedSelector(
    (state) => state.foo,
    (state) => state.foo,
    (state) => state.foo,
    (state) => state.foo,
    (state) => state.foo,
    (state: State, props: Props) => props.bar,
    (foo1, foo2, foo3, foo4, foo5, bar) => ({
      foo1, foo2, foo3, foo4, foo5, bar,
    }),
  )(
    (state: never, props: Props) => props.bar,
  );;

  selector2({foo: 'fizz'}, {bar: 42});
}

function testArrayArgument() {
  const selector = createCachedSelector([
    (state: {foo: string}) => state.foo,
    (state: {foo: string}) => state.foo,
    (state: never, props: {bar: number}) => props.bar,
  ], (foo1, foo2, bar) => ({foo1, foo2, bar}))(
    (state: never, props: {bar: number}) => props.bar,
  );

  const ret = selector({foo: 'fizz'}, {bar: 42});
  const foo1: string = ret.foo1;
  const foo2: string = ret.foo2;
  const bar: number = ret.bar;

  // typings:expect-error
  createCachedSelector([
    (state: {foo: string}) => state.foo,
  ])(
    (state: {foo: string}) => state.foo,
  );

  // typings:expect-error
  createCachedSelector([
    (state: {foo: string}) => state.foo,
    (state: {bar: number}) => state.bar,
  ], (foo, bar) => {})(
    (state: {foo: string}) => state.foo,
  );

  // typings:expect-error
  createCachedSelector([
    (state: {foo: string}) => state.foo,
    (state: {foo: string}) => state.foo,
  ], (foo: string, bar: number) => {})(
    (state: {foo: string}) => state.foo,
  );

  createCachedSelector([
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
  ], (foo1: string, foo2: string, foo3: string, foo4: string, foo5: string,
      foo6: string, foo7: string, foo8: string, foo9: string, foo10: string) => {
  })(
    (state: {foo: string}) => state.foo,
  );

  // typings:expect-error
  createCachedSelector([
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
  ], (foo1, foo2, foo3, foo4, foo5, foo6, foo7, foo8: number, foo9, foo10) => {

  })(
    (state: {foo: string}) => state.foo,
  );

  // typings:expect-error
  createCachedSelector([
    (state: {foo: string}) => state.foo,
    state => state.foo,
    state => state.foo,
    state => state.foo,
    state => state.foo,
    state => state.foo,
    state => state.foo,
    state => state.foo,
    1,
  ], (foo1, foo2, foo3, foo4, foo5, foo6, foo7, foo8, foo9) => {})(
    state => state.foo,
  );

  const selector2 = createCachedSelector([
    (state: {foo: string}) => state.foo,
    (state: {foo: string}) => state.foo,
    (state: {foo: string}) => state.foo,
    (state: {foo: string}) => state.foo,
    (state: {foo: string}) => state.foo,
    (state: {foo: string}) => state.foo,
    (state: {foo: string}) => state.foo,
    (state: {foo: string}) => state.foo,
    (state: {foo: string}) => state.foo,
  ], (foo1: string, foo2: string, foo3: string, foo4: string, foo5: string,
      foo6: string, foo7: string, foo8: string, foo9: string) => {
    return {foo1, foo2, foo3, foo4, foo5, foo6, foo7, foo8, foo9};
  })(
    (state: {foo: string}) => state.foo,
  );

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
    // typings:expect-error
    ret.foo10;
  }

  // typings:expect-error
  selector2({foo: 'fizz'}, {bar: 42});

  const parametric = createCachedSelector([
    (state: never, props: {bar: number}) => props.bar,
    (state: {foo: string}) => state.foo,
    (state: {foo: string}) => state.foo,
    (state: {foo: string}) => state.foo,
    (state: {foo: string}) => state.foo,
    (state: {foo: string}) => state.foo,
    (state: {foo: string}) => state.foo,
    (state: {foo: string}) => state.foo,
    (state: {foo: string}) => state.foo,
  ], (bar: number, foo1: string, foo2: string, foo3: string, foo4: string,
      foo5: string, foo6: string, foo7: string, foo8: string) => {
    return {foo1, foo2, foo3, foo4, foo5, foo6, foo7, foo8, bar};
  })(
    (state: never, props: {bar: number}) => props.bar,
  );

  // typings:expect-error
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
    // typings:expect-error
    ret.foo9;
  }
}
