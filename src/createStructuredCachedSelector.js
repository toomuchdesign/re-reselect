import {createStructuredSelector} from 'reselect';
import createCachedSelector from './createCachedSelector';

function createStructuredCachedSelector(selectors) {
  return createStructuredSelector(selectors, createCachedSelector);
}

export default createStructuredCachedSelector;
