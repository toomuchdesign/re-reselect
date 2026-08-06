import { createSelector, lruMemoize } from 'reselect';

import { createCachedSelector } from '../dist/es/index.js';
import { project } from './workload.mjs';

/**
 * Four ways to express the same keyed derivation, from the one under test to the
 * floor it could theoretically reach.
 *
 * Every case exposes `run(state, props)` and a `recomputations()` counter. The
 * counter is not decoration: a variant that looks fast because it silently skips
 * work would otherwise read as a win, and comparing recomputation counts across
 * cases is the only thing that rules that out.
 */

/**
 * The input is the entity, not the map that holds it.
 *
 * This is the difference between a memoization that works and one that cannot. The
 * reducer replaces the `entities` map on every write, so a selector taking the map
 * recomputes for every key on every tick no matter how it is cached — the
 * recomputation counter in the runner exists to catch exactly that. Taking
 * `entities[id]` instead means an entity nobody touched keeps its identity and its
 * derived value is reused, which is the whole premise of per-key caching.
 */
const selectEntity = (state, props) => state.entities[props.id];
const selectId = (_state, props) => props.id;

/** The subject: `createCachedSelector` exactly as it ships. */
export function createCachedCase() {
  let recomputations = 0;

  const selector = createCachedSelector(selectEntity, (entity) => {
    recomputations += 1;
    return project(entity);
  })({
    keySelector: selectId,
  });

  return {
    name: 'createCachedSelector',
    run: (state, props) => selector(state, props),
    recomputations: () => recomputations,
  };
}

/**
 * The subject with reselect's argument-level memoization swapped for a size-1 LRU.
 *
 * `createCachedSelector` has already picked the instance by key, so that instance
 * only ever sees one argument shape. reselect's default `weakMapMemoize` keys on
 * `(state, props)`, and `state` is a new object on every write, so it misses on
 * every call and allocates a WeakMap node to record the miss. A size-1 LRU compares
 * two references and allocates nothing.
 */
export function createCachedLruArgsCase() {
  let recomputations = 0;

  const selector = createCachedSelector(
    selectEntity,
    (entity) => {
      recomputations += 1;
      return project(entity);
    },
    { argsMemoize: lruMemoize },
  )({
    keySelector: selectId,
  });

  return {
    name: 'createCachedSelector + lru argsMemoize',
    run: (state, props) => selector(state, props),
    recomputations: () => recomputations,
  };
}

/**
 * Plain reselect with a parametric selector — no keyed instance cache at all.
 *
 * The reference for what the keyed layer costs. Worth knowing that on this shape it
 * is not a worse answer, only a smaller one: reselect 5 memoizes on input *values*,
 * and the input here is the entity, so an untouched entity returns its previous
 * result without any key cache. It recomputes exactly as often as the cached cases.
 *
 * What it does not give is a cache anyone can address — no eviction, no GC, no key
 * composition, no `getMatchingSelector`. Those are what `createCachedSelector` is
 * for, and this row is how much they cost.
 */
export function createReselectCase() {
  let recomputations = 0;

  const selector = createSelector([selectEntity], (entity) => {
    recomputations += 1;
    return project(entity);
  });

  return {
    name: 'reselect (parametric, no key cache)',
    run: (state, props) => selector(state, props),
    recomputations: () => recomputations,
  };
}

/**
 * The floor: one record per key holding the last input values and the last result.
 *
 * No selector instance per key, no argument-level memoization, one map lookup and
 * two reference compares per call. Nothing here is a usable library — it has no
 * cache object, no key composition, no introspection — but it is what the machinery
 * is being measured against, and the gap to it is the budget any rewrite has.
 */
export function createHandwrittenCase() {
  let recomputations = 0;
  const cache = new Map();

  const run = (state, props) => {
    const id = selectId(state, props);
    const entity = selectEntity(state, props);

    let record = cache.get(id);

    if (record === undefined) {
      record = { entity: undefined, result: undefined };
      cache.set(id, record);
    } else if (record.entity === entity) {
      return record.result;
    }

    recomputations += 1;
    record.entity = entity;
    record.result = project(entity);

    return record.result;
  };

  return {
    name: 'hand-written keyed memo (floor)',
    run,
    recomputations: () => recomputations,
  };
}

export const cases = [
  createCachedCase,
  createCachedLruArgsCase,
  createReselectCase,
  createHandwrittenCase,
];
