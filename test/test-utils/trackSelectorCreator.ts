import { type CreateSelectorFunction, createSelector } from 'reselect';
import { vi } from 'vitest';

/**
 * Observes "a new reselect selector was instantiated" through the public
 * `selectorCreator` option.
 *
 * The obvious alternative — spying on reselect's `createSelector` export —
 * cannot work against a published bundle: the bundle reads it off reselect's
 * own module namespace, which is frozen in ESM ("Cannot spy on export ...
 * Module namespace is not configurable").
 * Going through the documented option asserts the same thing while keeping one
 * suite runnable against the sources and all three bundles alike.
 */
export function trackSelectorCreator() {
  const spy = vi.fn(createSelector as unknown as (...args: any[]) => any);

  // `selectorCreator` is typed as reselect's `CreateSelectorFunction`, which
  // carries a `withTypes` property a bare mock does not have.
  return Object.assign(spy, { withTypes: () => spy }) as unknown as typeof spy &
    CreateSelectorFunction<any, any, any>;
}
