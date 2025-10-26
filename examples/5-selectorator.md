## Usage with [Selectorator](https://github.com/planttheidea/selectorator)

`re-reselect` accepts a `selectorCreator` option which allows to replace `reselects`'s `createSelector` with any other implementation.

### Wrap boilerplate code into a reusable create selector function

```js
import { createCachedSelector } from 're-reselect';
import createSelectoratorSelector from 'selectorator';

export function createCachedSelectorWithSelectorator(...args) {
  return (polymorphicOptions = {}) => {
    const options = {
      selectorCreator: createSelectoratorSelector,
    };

    if (typeof polymorphicOptions === 'function') {
      options.keySelector = polymorphicOptions;
    } else {
      Object.assign(options, polymorphicOptions);
    }

    return createCachedSelector(...args)(options);
  };
}
```

### Use selectorator in your app

```js
import { createCachedSelectorWithSelectorator } from './createCachedSelectorWithSelectorator';

// selector created with single method call
const getBarBaz = createCachedSelectorWithSelectorator(
  ['foo.bar', 'baz'],
  (bar, baz) => `${bar} ${baz}`,
)(({ baz }) => baz);

const state = {
  foo: { bar: 'bar' },
  baz: 'baz',
};

console.log(getBarBaz(state)); // "bar baz"
```
