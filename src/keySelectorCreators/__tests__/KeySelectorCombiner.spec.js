import createCachedSelector, {KeySelectorCombiner} from '../../../src/index';

const stateMock = {
  1: 'foo-state',
  2: 'bar-state',
  3: 'moo-state',
};

const propsMock = {
  foo: '1',
  bar: 2,
  moo: '3',
};

const inputSelector1 = createCachedSelector(
  state => state,
  (state, props) => props.foo,
  (state, id) => state[id]
)((state, props) => props.foo); // Used as chunk of keySelector (string)

const inputSelector2 = createCachedSelector(
  state => state,
  (state, props) => props.bar,
  (state, id) => state[id]
)((state, props) => props.bar); // Used as chunk of keySelector (number)

const inputSelector3 = (state, props) => state[props.moo];

describe('KeySelectorCombiner', () => {
  it("returns a keySelector composed of the provided inputSelectors' keySelectors", () => {
    const cachedSelector = createCachedSelector(
      inputSelector1,
      inputSelector2,
      inputSelector3,
      (first, second, third) => ({
        first,
        second,
      })
    )(null, {
      keySelectorCreator: new KeySelectorCombiner(),
    });

    const expectedKeySelector = (state, props) => `${props.foo}:${props.bar}`;
    const actualKeySelector = cachedSelector.keySelector;

    expect(actualKeySelector(stateMock, propsMock)).toEqual(
      expectedKeySelector(stateMock, propsMock)
    );
  });

  it('accepts an additional extraKeySelector property', () => {
    const cachedSelector = createCachedSelector(
      inputSelector1,
      inputSelector2,
      inputSelector3,
      (first, second, third) => ({
        first,
        second,
      })
    )(null, {
      keySelectorCreator: new KeySelectorCombiner({
        extraKeySelector: (_, props) => props.moo,
      }),
    });

    const expectedKeySelector = (state, props) =>
      `${props.moo}:${props.foo}:${props.bar}`;
    const actualKeySelector = cachedSelector.keySelector;

    expect(actualKeySelector(stateMock, propsMock)).toEqual(
      expectedKeySelector(stateMock, propsMock)
    );
  });
});
