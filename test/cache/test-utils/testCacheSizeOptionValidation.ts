import { describe, expect, it } from 'vitest';

import type { ICacheObject } from '../../../src/';

function testCacheSizeOptionValidation(
  CacheObject: new (options: { cacheSize: number }) => ICacheObject,
) {
  describe('cacheSize option validation', () => {
    it('throws error if not defined', () => {
      expect(() => {
        const cache = new CacheObject({
          // @ts-expect-error
          cacheSize: undefined,
        });
      }).toThrow('Missing the required property "cacheSize".');
    });

    it('throws error if not a positive integer', () => {
      const wrongValues = [2.5, -12, 0];

      wrongValues.forEach((value) => {
        expect(() => {
          const cache = new CacheObject({ cacheSize: value });
        }).toThrow(
          'The "cacheSize" property must be a positive integer value.',
        );
      });
    });

    it("doesn't throw if a positive integer", () => {
      expect(() => {
        const cache = new CacheObject({ cacheSize: 22 });
      }).not.toThrow();
    });
  });
}

export default testCacheSizeOptionValidation;
