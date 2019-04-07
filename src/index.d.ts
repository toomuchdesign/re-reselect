import {createSelector} from 'reselect';

export type Selector<S, R> = (state: S) => R;
export type ParametricSelector<S, P, R> = (
  state: S,
  props: P,
  ...args: any[]
) => R;

export type KeySelector<S> = (state: S, ...args: any[]) => any;
export type ParametricKeySelector<S, P> = (
  state: S,
  props: P,
  ...args: any[]
) => any;

export type OutputSelector<S, R, C, D> = Selector<S, R> & {
  resultFunc: C;
  dependencies: D;
  recomputations: () => number;
  resetRecomputations: () => number;
};
export type OutputParametricSelector<S, P, R, C, D> = ParametricSelector<
  S,
  P,
  R
> & {
  resultFunc: C;
  dependencies: D;
  recomputations: () => number;
  resetRecomputations: () => number;
};

export type CreateSelectorInstance = typeof createSelector;

type Options =
  | {
      selectorCreator?: CreateSelectorInstance;
      cacheObject: ICacheObject;
    }
  | {
      selectorCreator: CreateSelectorInstance;
      cacheObject?: ICacheObject;
    }
  | CreateSelectorInstance;

export type OutputCachedSelector<S, R, C, D> = (
  keySelector: KeySelector<S>,
  optionsOrSelectorCreator?: Options
) => OutputSelector<S, R, C, D> & {
  getMatchingSelector: (state: S, ...args: any[]) => OutputSelector<S, R, C, D>;
  removeMatchingSelector: (state: S, ...args: any[]) => void;
  clearCache: () => void;
  cache: ICacheObject;
};

export type OutputParametricCachedSelector<S, P, R, C, D> = (
  keySelector: ParametricKeySelector<S, P>,
  optionsOrSelectorCreator?: Options
) => OutputParametricSelector<S, P, R, C, D> & {
  getMatchingSelector: (
    state: S,
    props: P,
    ...args: any[]
  ) => OutputParametricSelector<S, P, R, C, D>;
  removeMatchingSelector: (state: S, props: P, ...args: any[]) => void;
  clearCache: () => void;
  cache: ICacheObject;
};

export default function createCachedSelector<S1, R1, T>(
  selector: Selector<S1, R1>,
  combiner: (res: R1) => T
): OutputCachedSelector<S1, T, (res: R1) => T, [Selector<S1, R1>]>;

export default function createCachedSelector<S1, R1, T>(
  selectors: [Selector<S1, R1>],
  combiner: (res: R1) => T
): OutputCachedSelector<S1, T, (res: R1) => T, [Selector<S1, R1>]>;

export default function createCachedSelector<S1, P1, R1, T>(
  selector: ParametricSelector<S1, P1, R1>,
  combiner: (res: R1) => T
): OutputParametricCachedSelector<
  S1,
  P1,
  T,
  (res: R1) => T,
  [ParametricSelector<S1, P1, R1>]
>;

export default function createCachedSelector<S1, P1, R1, T>(
  selectors: [ParametricSelector<S1, P1, R1>],
  combiner: (res: R1) => T
): OutputParametricCachedSelector<
  S1,
  P1,
  T,
  (res: R1) => T,
  [ParametricSelector<S1, P1, R1>]
>;

/* any number of uniform selectors */

export default function createCachedSelector<S, R, T>(
  selectors: Selector<S, R>[],
  combiner: (...res: R[]) => T
): OutputCachedSelector<S, T, (...res: R[]) => T, Selector<S, R>[]>;
export default function createCachedSelector<S, P, R, T>(
  selectors: ParametricSelector<S, P, R>[],
  combiner: (...res: R[]) => T
): OutputParametricCachedSelector<
  S,
  P,
  T,
  (...res: R[]) => T,
  ParametricSelector<S, P, R>[]
>;

export interface ICacheObject {
  set(key: any, selectorFn: any): void;
  get(key: any): any;
  remove(key: any): void;
  clear(): void;
  isValidCacheKey?(key: any): boolean;
}

type ObjectCacheKey = string | number;

export class FlatObjectCache implements ICacheObject {
  set(key: ObjectCacheKey, selectorFn: any): void;
  get(key: ObjectCacheKey): any;
  remove(key: ObjectCacheKey): void;
  clear(): void;
  isValidCacheKey(key: ObjectCacheKey): boolean;
}

export class FifoObjectCache implements ICacheObject {
  constructor(options: {cacheSize: number});
  set(key: ObjectCacheKey, selectorFn: any): void;
  get(key: ObjectCacheKey): any;
  remove(key: ObjectCacheKey): void;
  clear(): void;
  isValidCacheKey(key: ObjectCacheKey): boolean;
}

export class LruObjectCache implements ICacheObject {
  constructor(options: {cacheSize: number});
  set(key: ObjectCacheKey, selectorFn: any): void;
  get(key: ObjectCacheKey): any;
  remove(key: ObjectCacheKey): void;
  clear(): void;
  isValidCacheKey(key: ObjectCacheKey): boolean;
}

export class FlatMapCache implements ICacheObject {
  set(key: any, selectorFn: any): void;
  get(key: any): any;
  remove(key: any): void;
  clear(): void;
}

export class FifoMapCache implements ICacheObject {
  constructor(options: {cacheSize: number});
  set(key: any, selectorFn: any): void;
  get(key: any): any;
  remove(key: any): void;
  clear(): void;
}

export class LruMapCache implements ICacheObject {
  constructor(options: {cacheSize: number});
  set(key: any, selectorFn: any): void;
  get(key: any): any;
  remove(key: any): void;
  clear(): void;
}
