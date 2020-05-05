## Cache API calls

This example shows how `re-reselect` can be used _not as a selector_ but to **cache API calls** in a typical **Redux scenario**.

A working proof of concept can be found [here](https://codesandbox.io/s/py8prlj7om).

Thanks to [@greggb](https://github.com/greggb) for the idea and the demo.

#### `page/api.js`

```js
import { createCachedSelector } from 're-reselect';
import fetchFromApi from './api';

const fetchPageWithCache = createCachedSelector(
  pageId => pageId,
  // Return and retain a Promise as a result
  pageId => fetchFromApi(pageId),
)(
  /*
   * Re-reselect resolver function.
   * Cache a new selector for each new "pageId"
   */
  pageId => pageId,
);

export fetchPageWithCache;
```

#### `page/actions.js`

```js
import {fetchPageWithCache} from './api';

actionFetchPage(pageId) {
  return (dispatch) => {
    dispatch({ type: 'REQUEST_PAGE', pageId });

    // Get cached resolved promise and dispatch result
    return fetchPageWithCache(pageId)
      .then(
        result => dispatch({
          type: 'RECEIVE_PAGE', success: true, pageId, payload: result,
        }),
        error => dispatch({
          type: 'RECEIVE_PAGE', success: false, pageId, payload: error,
        }),
        /*
         * On error we might also opt for removing the matching cache entry
         * in order to refetch the page on future requests:
         * fetchPageWithCache.removeMatchingSelector(pageId);
         */
      );
  };
},

export actionFetchPage;
```
