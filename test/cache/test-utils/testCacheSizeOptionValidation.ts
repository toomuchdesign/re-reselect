import { describe, expect, it } from 'vitest';

import type { ICacheObject } from '../../../src/';

function testCacheSizeOptionValidation(
  CacheObject: new (options: { cacheSize: number }) => ICacheObject,
) {
  describe('cacheSize option validation', () => {
    it('throws error if not defined', () => {
      expect(() => {
        // @ts-expect-error option object required
        const cache = new CacheObject();
      }).toThrow(/Missing/);
    });

    it('throws error if not a positive integer', () => {
      const wrongValues = [2.5, -12, 0];

      wrongValues.forEach((value) => {
        expect(() => {
          const cache = new CacheObject({ cacheSize: value });
        }).toThrow(/a positive integer/);
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
