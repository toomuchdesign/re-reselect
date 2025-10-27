import createCachedSelector from './createCachedSelector';
import { createStructuredSelector } from './reselectWrapper.ts';

function createStructuredCachedSelector(selectors) {
  return createStructuredSelector(selectors, createCachedSelector);
}

export default createStructuredCachedSelector;
