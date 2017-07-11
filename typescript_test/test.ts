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
