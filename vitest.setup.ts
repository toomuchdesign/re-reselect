import { setGlobalDevModeChecks } from 'reselect';
import { beforeAll } from 'vitest';

beforeAll(() => {
  setGlobalDevModeChecks({
    inputStabilityCheck: 'never',
    identityFunctionCheck: 'never',
  });
});
