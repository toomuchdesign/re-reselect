function combineKeySelectors({inputSelectors = [], keySelector}) {
  const keySelectors = inputSelectors
    .map(entry => entry.keySelector)
    .filter(keySelector => typeof keySelector === 'function');

  if (typeof keySelector === 'function') {
    keySelectors.unshift(keySelector);
  }

  return (...args) => {
    return keySelectors
      .map(keySelector => keySelector(...args))
      .filter(value => {
        // @TODO consider throwing an error or other solutions
        const valueType = typeof value;
        return valueType === 'string' || valueType === 'number';
      })
      .join(':');
  };
}

export default combineKeySelectors;
