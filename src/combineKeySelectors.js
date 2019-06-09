function combineKeySelectors(inputSelectors = []) {
  const keySelectors = inputSelectors
    .filter(entry => entry.hasOwnProperty('keySelector'))
    .map(entry => entry.keySelector);

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

// @TODO Consider whether using class to signal a keySelectorCreator
combineKeySelectors.keySelectorCreator = true;

export default combineKeySelectors;