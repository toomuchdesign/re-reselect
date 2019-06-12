function combineKeySelectors({inputSelectors = [], keySelector}) {
  const keySelectors = inputSelectors
    .filter(entry => entry.hasOwnProperty('keySelector'))
    .map(entry => entry.keySelector);

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
