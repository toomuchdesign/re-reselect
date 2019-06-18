import createCachedSelector, {KeySelectorCombiner} from '../src/index';

type State = {
  a: 1,
  b: '2'
};

function testKeySelectorCombiner() {
  const cachedSelector = createCachedSelector(
    (state: State) => state.a,
    (state: State) => state.b,
    (first, second) => ({
      first,
      second,
    })
  )(() => '', {
    keySelectorCreator: new KeySelectorCombiner(),
  });
}
