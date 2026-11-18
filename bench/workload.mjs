/**
 * The workload every case in the benchmark replays.
 *
 * It is deliberately not a synthetic tight loop over one key. The shape that
 * decides `createCachedSelector`'s cost in a real application is:
 *
 *   - the state object's identity changes on every write, so any memoization
 *     keyed on `state` misses every time;
 *   - only a small fraction of entities actually change per write, so the
 *     memoization keyed on *input values* hits for most keys;
 *   - the selector is called once per mounted key per tick, so per-call overhead
 *     is multiplied by keys × ticks rather than amortized.
 *
 * Together those mean the interesting number is not "how fast is a cache hit" but
 * "what does one call cost when the result is already correct" — which is the
 * situation the overwhelming majority of calls are in.
 */

const ENTITY_COUNT = 1000;
const CHANGED_PER_TICK = 50;

export const config = {
  entities: ENTITY_COUNT,
  changedPerTick: CHANGED_PER_TICK,
  /** Keys read per tick — every entity is subscribed, as a mounted list would be. */
  keysPerTick: ENTITY_COUNT,
};

export function createInitialState() {
  const entities = {};

  for (let id = 0; id < ENTITY_COUNT; id += 1) {
    entities[id] = { id, value: id, label: 'e' + id };
  }

  return { entities };
}

/**
 * One write: a new state object and new objects for the changed entities only,
 * every other entity keeping its identity. This is what an immutable reducer
 * produces and it is what makes per-key memoization worth anything.
 */
export function applyTick(state, tick) {
  const entities = { ...state.entities };

  for (let i = 0; i < CHANGED_PER_TICK; i += 1) {
    const id = (tick * CHANGED_PER_TICK + i) % ENTITY_COUNT;
    const previous = entities[id];
    entities[id] = { id, value: previous.value + 1, label: previous.label };
  }

  return { entities };
}

/** The derivation under memoization. Cheap on purpose: this benchmark prices the
 * machinery around it, and an expensive combiner would mask exactly that. */
export function project(entity) {
  return { id: entity.id, text: entity.label + ':' + entity.value };
}

/** Props objects are allocated once and reused, as a mounted component's would be. */
export function createProps() {
  const props = new Array(ENTITY_COUNT);

  for (let id = 0; id < ENTITY_COUNT; id += 1) {
    props[id] = { id };
  }

  return props;
}
