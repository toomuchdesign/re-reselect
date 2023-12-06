import {setGlobalDevModeChecks} from 'reselect';

beforeAll(() => {
  setGlobalDevModeChecks({
    inputStabilityCheck: 'never',
    identityFunctionCheck: 'never',
  });
});
