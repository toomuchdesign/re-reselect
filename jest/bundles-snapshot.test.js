import {readFileSync} from 'fs';
import {join} from 'path';

describe('UMD bundle', () => {
  it('is unchanged', () => {
    const bundle = readFileSync(
      join(__dirname, '..', 'dist/umd/index.js'),
      'utf8'
    );
    expect(bundle).toMatchSnapshot();
  });
});
