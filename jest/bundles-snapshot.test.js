import {readFileSync} from 'fs';
import {join} from 'path';

describe('Dist bundle', () => {
  it('is unchanged', () => {
    const bundle = readFileSync(join(__dirname, '..', 'dist/index.js'), 'utf8');
    expect(bundle).toMatchSnapshot();
  });
});
