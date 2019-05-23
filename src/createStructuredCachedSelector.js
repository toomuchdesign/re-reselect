import {createStructuredSelector} from 'reselect';
import createCachedSelector from './index';

function createStructuredCachedSelector(selectors) {
  return createStructuredSelector(selectors, createCachedSelector);
}

export default createStructuredCachedSelector;
