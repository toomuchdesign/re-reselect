## Programmatic keySelector composition

This example shows how decouple `keySelector` from provided `inputSelectors` and make it flexible enough to automatically handle changes in `inputSelector` declarations.

The final `keySelector` will be the composition of provided `inputSelectors`' keySelectors.

Since we don't want to know the number of provided `inputSelectors` upfront, we'll make use of `keySelectorCreator` option: a function to **generate the actual `keySelector` at runtime** based on the actually provided `inputselectors`.

`keySelectorCreator` might be implemented like this:

- get `inputSelectors` array
- filter out `inputSelectors` without a `keySelector` property
- return the chained result of `inputSelectors`'s `keySelector` property (`res1:res2:res3`)

> In the future a similar utility might be shipped with `re-reselect` itself.

#### `keySelectorCombiner.js`

```js
return function keySelectorCombiner({inputSelectors = []} = {}) {
  const keySelectors = inputSelectors
    .map(entry => entry.keySelector)
    .filter(keySelector => typeof keySelector === 'function');

  // The actual keySelector
  return (...args) => {
    return keySelectors
      .map(keySelector => keySelector(...args))
      .filter(value => {
        const valueType = typeof value;
        return valueType === 'string' || valueType === 'number';
      })
      .join(':');
  };
};
```

#### `composedSelector.js`

```js
import createCachedSelector from 're-reselect';
import keySelectorCombiner from './keySelectorCombiner';

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
)((state, props) => props.foo); // Used for keySelector composition (string)

const inputSelector2 = createCachedSelector(
  state => state,
  (state, props) => props.bar,
  (state, id) => state[id]
)((state, props) => props.bar); // Used for keySelector composition (number)

const inputSelector3 = (state, props) => state[props.moo];

const composedSelector = createCachedSelector(
  inputSelector1,
  inputSelector2,
  inputSelector3,
  (first, second, third) => ({
    first,
    second,
  })
)({
  keySelectorCreator: keySelectorCombiner,
});
```
