import { createCachedSelector } from './createCachedSelector';
import { createStructuredSelector } from './reselectWrapper.ts';

export function createStructuredCachedSelector(selectors) {
  return createStructuredSelector(selectors, createCachedSelector);
}
