/**
 * Per-call cost of `createCachedSelector`.
 *
 * Run with `npm run bench`, which passes `--expose-gc` so each round starts from a
 * collected heap instead of inheriting whatever the previous one left behind.
 *
 * Two things this deliberately does *not* do. It does not report an average of
 * every round: a benchmark round that lost the CPU to something else is not a
 * slower implementation, so the minimum is the statistic and the spread is printed
 * beside it — a gap smaller than a case's own spread is not a result. And it does
 * not compare cases whose recomputation counts differ without saying so, because a
 * case that recomputes less is answering a different question.
 */
import { cases } from './cases.mjs';
import {
  applyTick,
  config,
  createInitialState,
  createProps,
} from './workload.mjs';

/**
 * There is no allocation column, and that is deliberate rather than an omission.
 *
 * Two ways to add one were tried and both measure something other than what they
 * claim. A delta between two `heapUsed` readings reports what the collector had not
 * got round to freeing at the instant of the second reading — it moves with V8's
 * scheduling, and on a change that removed two array allocations per call it went
 * *up*. And `PerformanceObserver` lists `gc` among its supported entry types but
 * emits no entries on this runtime, under forced collection or sustained pressure
 * alike, so a GC-time column would read zero regardless of what the code does.
 *
 * Allocation is not invisible here: it is paid in the time column, which is where a
 * caller feels it too. A metric that cannot be trusted is worse than no metric.
 */

const TICKS = 200;
const ROUNDS = 7;
const WARMUP_ROUNDS = 2;

const CALLS_PER_ROUND = TICKS * config.keysPerTick;

function collectGarbage() {
  if (typeof globalThis.gc === 'function') {
    // Twice: the first pass can resurrect objects held by finalizers, and the
    // second gives a settled floor to measure from.
    globalThis.gc();
    globalThis.gc();
    return true;
  }
  return false;
}

/** One round: build a fresh case, replay the script, return time and heap delta. */
function runRound(createCase, props) {
  const instance = createCase();
  let state = createInitialState();

  // Prime the cache so the round measures steady state rather than N cache misses.
  for (let key = 0; key < config.keysPerTick; key += 1) {
    instance.run(state, props[key]);
  }

  collectGarbage();
  const startedAt = performance.now();

  for (let tick = 0; tick < TICKS; tick += 1) {
    state = applyTick(state, tick);

    for (let key = 0; key < config.keysPerTick; key += 1) {
      instance.run(state, props[key]);
    }
  }

  const elapsed = performance.now() - startedAt;

  return {
    elapsed,
    recomputations: instance.recomputations(),
  };
}

function measure(createCase, props) {
  for (let i = 0; i < WARMUP_ROUNDS; i += 1) {
    runRound(createCase, props);
  }

  const rounds = [];
  for (let i = 0; i < ROUNDS; i += 1) {
    rounds.push(runRound(createCase, props));
  }

  const times = rounds.map((round) => round.elapsed).sort((a, b) => a - b);

  const min = times[0];
  const max = times[times.length - 1];
  const middle = (rounds.length / 2) | 0;

  return {
    name: createCase().name,
    minMs: min,
    medianMs: times[middle],
    spread: min > 0 ? (max - min) / min : 0,
    nsPerCall: (min * 1e6) / CALLS_PER_ROUND,
    recomputations: rounds[0].recomputations,
  };
}

function pad(value, width) {
  const text = String(value);
  return text.length >= width ? text : ' '.repeat(width - text.length) + text;
}

function main() {
  const exposedGc = collectGarbage();
  const props = createProps();

  console.log(
    `\ncreateCachedSelector — ${config.keysPerTick} keys x ${TICKS} ticks = ` +
      `${CALLS_PER_ROUND.toLocaleString('en-US')} calls per round, ` +
      `${config.changedPerTick} of ${config.entities} entities change per tick`,
  );

  if (!exposedGc) {
    console.log(
      'WARNING: run with --expose-gc, rounds start from an uncontrolled heap',
    );
  }

  const results = cases.map((createCase) => measure(createCase, props));

  console.log('');
  console.log(
    `${pad('case', 38)} ${pad('min ms', 9)} ${pad('ns/call', 9)} ` +
      `${pad('spread', 7)} ${pad('recomputes', 11)}`,
  );

  const baseline = results[0];

  for (const result of results) {
    const ratio = result.minMs / baseline.minMs;

    console.log(
      `${pad(result.name, 38)} ${pad(result.minMs.toFixed(1), 9)} ` +
        `${pad(result.nsPerCall.toFixed(1), 9)} ` +
        `${pad((result.spread * 100).toFixed(0) + '%', 7)} ` +
        `${pad(result.recomputations.toLocaleString('en-US'), 11)}` +
        (result === baseline ? '' : `   ${ratio.toFixed(2)}x`),
    );
  }

  const expected = TICKS * config.changedPerTick;
  console.log(
    `\nA correctly memoized case recomputes ${expected.toLocaleString('en-US')} times ` +
      `(${config.changedPerTick} changed entities x ${TICKS} ticks). ` +
      `A case far above that is thrashing; far below, it is skipping work.`,
  );
}

main();
