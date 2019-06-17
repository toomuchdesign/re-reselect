class KeySelectorCombiner {
  constructor({extraKeySelector, separator = ':'} = {}) {
    // Invoked as keySelectorCreator
    return function keySelectorCombiner({inputSelectors = []} = {}) {
      const keySelectors = inputSelectors
        .map(entry => entry.keySelector)
        .filter(keySelector => typeof keySelector === 'function');

      if (typeof extraKeySelector === 'function') {
        keySelectors.unshift(extraKeySelector);
      }

      // The actual keySelector
      return (...args) => {
        return keySelectors
          .map(keySelector => keySelector(...args))
          .filter(value => {
            // @TODO consider throwing an error or other solutions
            const valueType = typeof value;
            return valueType === 'string' || valueType === 'number';
          })
          .join(separator);
      };
    };
  }
}

export default KeySelectorCombiner;
