import { createSelector } from 'reselect';

export type Selector<S, R> = (state: S) => R;

export type Resolver<S> = (state: S, ...args: any[]) => any;

export type CreateSelectorInstance = typeof createSelector;

type Options = {
  selectorCreator?: CreateSelectorInstance;
  cacheObject: ICacheObject;
}|{
  selectorCreator: CreateSelectorInstance;
  cacheObject?: ICacheObject;
}|CreateSelectorInstance;

export type OutputSelector<S, R, C> = Selector<S, R> & {
  resultFunc: C;
  recomputations: () => number;
  resetRecomputations: () => number;
};

export type OutputCachedSelector<S, R, C> = (resolver: Resolver<S>, optionsOrSelectorCreator?: Options) => OutputSelector<S, R, C> & {
  getMatchingSelector: (state: S, ...args: any[]) => OutputSelector<S, R, C>;
  removeMatchingSelector: (state: S, ...args: any[]) => void;
  clearCache: () => void;
  resultFunc: C;
};

export type ParametricSelector<S, P, R> = (state: S, props: P, ...args: any[]) => R;

export type ParametricResolver<S, P> = (state: S, props: P, ...args: any[]) => any;

export type OutputParametricSelector<S, P, R, C> = ParametricSelector<S, P, R> & {
  resultFunc: C;
  recomputations: () => number;
  resetRecomputations: () => number;
};

export type OutputParametricCachedSelector<S, P, R, C> = (resolver: ParametricResolver<S, P>, optionsOrSelectorCreator?: Options) => OutputParametricSelector<S, P, R, C> & {
  getMatchingSelector: (state: S, props: P, ...args: any[]) => OutputParametricSelector<S, P, R, C>;
  removeMatchingSelector: (state: S, props: P, ...args: any[]) => void;
  clearCache: () => void;
  resultFunc: C;
};

/* one selector */
export default function createCachedSelector<S, R1, T> (
  selector: Selector<S, R1>,
  combiner: (res: R1) => T
): OutputCachedSelector<S, T, (res: R1) => T>;
export default function createCachedSelector<S, P, R1, T> (
  selector: ParametricSelector<S, P, R1>,
  combiner: (res: R1) => T
): OutputParametricCachedSelector<S, P, T, (res: R1) => T>;

/* two selectors */
export default function createCachedSelector<S, R1, R2, T> (
  selector1: Selector<S, R1>,
  selector2: Selector<S, R2>,
  combiner: (res1: R1, res2: R2) => T
): OutputCachedSelector<S, T, (res1: R1, res2: R2) => T>;
export default function createCachedSelector<S, P, R1, R2, T> (
  selector1: ParametricSelector<S, P, R1>,
  selector2: ParametricSelector<S, P, R2>,
  combiner: (res1: R1, res2: R2) => T
): OutputParametricCachedSelector<S, P, T, (res1: R1, res2: R2) => T>;

/* three selectors */
export default function createCachedSelector<S, R1, R2, R3, T> (
  selector1: Selector<S, R1>,
  selector2: Selector<S, R2>,
  selector3: Selector<S, R3>,
  combiner: (res1: R1, res2: R2, res3: R3) => T
): OutputCachedSelector<S, T, (res1: R1, res2: R2, res3: R3) => T>;
export default function createCachedSelector<S, P, R1, R2, R3, T> (
  selector1: ParametricSelector<S, P, R1>,
  selector2: ParametricSelector<S, P, R2>,
  selector3: ParametricSelector<S, P, R3>,
  combiner: (res1: R1, res2: R2, res3: R3) => T
): OutputParametricCachedSelector<S, P, T, (res1: R1, res2: R2, res3: R3) => T>;

/* four selectors */
export default function createCachedSelector<S, R1, R2, R3, R4, T> (
  selector1: Selector<S, R1>,
  selector2: Selector<S, R2>,
  selector3: Selector<S, R3>,
  selector4: Selector<S, R4>,
  combiner: (res1: R1, res2: R2, res3: R3, res4: R4) => T
): OutputCachedSelector<S, T, (res1: R1, res2: R2, res3: R3, res4: R4) => T>;
export default function createCachedSelector<S, P, R1, R2, R3, R4, T> (
  selector1: ParametricSelector<S, P, R1>,
  selector2: ParametricSelector<S, P, R2>,
  selector3: ParametricSelector<S, P, R3>,
  selector4: ParametricSelector<S, P, R4>,
  combiner: (res1: R1, res2: R2, res3: R3, res4: R4) => T
): OutputParametricCachedSelector<S, P, T, (res1: R1, res2: R2, res3: R3, res4: R4) => T>;

/* five selectors */
export default function createCachedSelector<S, R1, R2, R3, R4, R5, T> (
  selector1: Selector<S, R1>,
  selector2: Selector<S, R2>,
  selector3: Selector<S, R3>,
  selector4: Selector<S, R4>,
  selector5: Selector<S, R5>,
  combiner: (res1: R1, res2: R2, res3: R3, res4: R4, res5: R5) => T
): OutputCachedSelector<S, T, (res1: R1, res2: R2, res3: R3, res4: R4, res5: R5) => T>;
export default function createCachedSelector<S, P, R1, R2, R3, R4, R5, T> (
  selector1: ParametricSelector<S, P, R1>,
  selector2: ParametricSelector<S, P, R2>,
  selector3: ParametricSelector<S, P, R3>,
  selector4: ParametricSelector<S, P, R4>,
  selector5: ParametricSelector<S, P, R5>,
  combiner: (res1: R1, res2: R2, res3: R3, res4: R4, res5: R5) => T
): OutputParametricCachedSelector<S, P, T, (res1: R1, res2: R2, res3: R3, res4: R4, res5: R5) => T>;

/* six selectors */
export default function createCachedSelector<S, R1, R2, R3, R4, R5, R6, T> (
  selector1: Selector<S, R1>,
  selector2: Selector<S, R2>,
  selector3: Selector<S, R3>,
  selector4: Selector<S, R4>,
  selector5: Selector<S, R5>,
  selector6: Selector<S, R6>,
  combiner: (res1: R1, res2: R2, res3: R3, res4: R4, res5: R5, res6: R6) => T
): OutputCachedSelector<S, T, (res1: R1, res2: R2, res3: R3, res4: R4, res5: R5, res6: R6) => T>;
export default function createCachedSelector<S, P, R1, R2, R3, R4, R5, R6, T> (
  selector1: ParametricSelector<S, P, R1>,
  selector2: ParametricSelector<S, P, R2>,
  selector3: ParametricSelector<S, P, R3>,
  selector4: ParametricSelector<S, P, R4>,
  selector5: ParametricSelector<S, P, R5>,
  selector6: ParametricSelector<S, P, R6>,
  combiner: (res1: R1, res2: R2, res3: R3, res4: R4, res5: R5, res6: R6) => T
): OutputParametricCachedSelector<S, P, T, (res1: R1, res2: R2, res3: R3, res4: R4, res5: R5, res6: R6) => T>;

/* seven selectors */
export default function createCachedSelector<S, R1, R2, R3, R4, R5, R6, R7, T> (
  selector1: Selector<S, R1>,
  selector2: Selector<S, R2>,
  selector3: Selector<S, R3>,
  selector4: Selector<S, R4>,
  selector5: Selector<S, R5>,
  selector6: Selector<S, R6>,
  selector7: Selector<S, R7>,
  combiner: (res1: R1, res2: R2, res3: R3, res4: R4, res5: R5, res6: R6,
            res7: R7) => T
): OutputCachedSelector<S, T, (res1: R1, res2: R2, res3: R3, res4: R4, res5: R5, res6: R6,
            res7: R7) => T>;
export default function createCachedSelector<S, P, R1, R2, R3, R4, R5, R6, R7, T> (
  selector1: ParametricSelector<S, P, R1>,
  selector2: ParametricSelector<S, P, R2>,
  selector3: ParametricSelector<S, P, R3>,
  selector4: ParametricSelector<S, P, R4>,
  selector5: ParametricSelector<S, P, R5>,
  selector6: ParametricSelector<S, P, R6>,
  selector7: ParametricSelector<S, P, R7>,
  combiner: (res1: R1, res2: R2, res3: R3, res4: R4, res5: R5, res6: R6,
            res7: R7) => T
): OutputParametricCachedSelector<S, P, T, (res1: R1, res2: R2, res3: R3, res4: R4, res5: R5, res6: R6,
            res7: R7) => T>;

/* eight selectors */
export default function createCachedSelector<S, R1, R2, R3, R4, R5, R6, R7, R8, T> (
  selector1: Selector<S, R1>,
  selector2: Selector<S, R2>,
  selector3: Selector<S, R3>,
  selector4: Selector<S, R4>,
  selector5: Selector<S, R5>,
  selector6: Selector<S, R6>,
  selector7: Selector<S, R7>,
  selector8: Selector<S, R8>,
  combiner: (res1: R1, res2: R2, res3: R3, res4: R4, res5: R5, res6: R6,
            res7: R7, res8: R8) => T
): OutputCachedSelector<S, T, (res1: R1, res2: R2, res3: R3, res4: R4, res5: R5, res6: R6,
            res7: R7, res8: R8) => T>;
export default function createCachedSelector<S, P, R1, R2, R3, R4, R5, R6, R7, R8, T> (
  selector1: ParametricSelector<S, P, R1>,
  selector2: ParametricSelector<S, P, R2>,
  selector3: ParametricSelector<S, P, R3>,
  selector4: ParametricSelector<S, P, R4>,
  selector5: ParametricSelector<S, P, R5>,
  selector6: ParametricSelector<S, P, R6>,
  selector7: ParametricSelector<S, P, R7>,
  selector8: ParametricSelector<S, P, R8>,
  combiner: (res1: R1, res2: R2, res3: R3, res4: R4, res5: R5, res6: R6,
            res7: R7, res8: R8) => T
): OutputParametricCachedSelector<S, P, T, (res1: R1, res2: R2, res3: R3, res4: R4, res5: R5, res6: R6,
            res7: R7, res8: R8) => T>;

/* nine selectors */
export default function createCachedSelector<S, R1, R2, R3, R4, R5, R6, R7, R8, R9, T> (
  selector1: Selector<S, R1>,
  selector2: Selector<S, R2>,
  selector3: Selector<S, R3>,
  selector4: Selector<S, R4>,
  selector5: Selector<S, R5>,
  selector6: Selector<S, R6>,
  selector7: Selector<S, R7>,
  selector8: Selector<S, R8>,
  selector9: Selector<S, R9>,
  combiner: (res1: R1, res2: R2, res3: R3, res4: R4, res5: R5, res6: R6,
            res7: R7, res8: R8, res9: R9) => T
): OutputCachedSelector<S, T, (res1: R1, res2: R2, res3: R3, res4: R4, res5: R5, res6: R6,
            res7: R7, res8: R8, res9: R9) => T>;
export default function createCachedSelector<S, P, R1, R2, R3, R4, R5, R6, R7, R8, R9, T> (
  selector1: ParametricSelector<S, P, R1>,
  selector2: ParametricSelector<S, P, R2>,
  selector3: ParametricSelector<S, P, R3>,
  selector4: ParametricSelector<S, P, R4>,
  selector5: ParametricSelector<S, P, R5>,
  selector6: ParametricSelector<S, P, R6>,
  selector7: ParametricSelector<S, P, R7>,
  selector8: ParametricSelector<S, P, R8>,
  selector9: ParametricSelector<S, P, R9>,
  combiner: (res1: R1, res2: R2, res3: R3, res4: R4, res5: R5, res6: R6,
            res7: R7, res8: R8, res9: R9) => T
): OutputParametricCachedSelector<S, P, T, (res1: R1, res2: R2, res3: R3, res4: R4, res5: R5, res6: R6,
            res7: R7, res8: R8, res9: R9) => T>;

/* ten selectors */
export default function createCachedSelector<S, R1, R2, R3, R4, R5, R6, R7, R8, R9, R10, T> (
  selector1: Selector<S, R1>,
  selector2: Selector<S, R2>,
  selector3: Selector<S, R3>,
  selector4: Selector<S, R4>,
  selector5: Selector<S, R5>,
  selector6: Selector<S, R6>,
  selector7: Selector<S, R7>,
  selector8: Selector<S, R8>,
  selector9: Selector<S, R9>,
  selector10: Selector<S, R10>,
  combiner: (res1: R1, res2: R2, res3: R3, res4: R4, res5: R5, res6: R6,
            res7: R7, res8: R8, res9: R9, res10: R10) => T
): OutputCachedSelector<S, T, (res1: R1, res2: R2, res3: R3, res4: R4, res5: R5, res6: R6,
            res7: R7, res8: R8, res9: R9, res10: R10) => T>;
export default function createCachedSelector<S, P, R1, R2, R3, R4, R5, R6, R7, R8, R9, R10, T> (
  selector1: ParametricSelector<S, P, R1>,
  selector2: ParametricSelector<S, P, R2>,
  selector3: ParametricSelector<S, P, R3>,
  selector4: ParametricSelector<S, P, R4>,
  selector5: ParametricSelector<S, P, R5>,
  selector6: ParametricSelector<S, P, R6>,
  selector7: ParametricSelector<S, P, R7>,
  selector8: ParametricSelector<S, P, R8>,
  selector9: ParametricSelector<S, P, R9>,
  selector10: ParametricSelector<S, P, R10>,
  combiner: (res1: R1, res2: R2, res3: R3, res4: R4, res5: R5, res6: R6,
            res7: R7, res8: R8, res9: R9, res10: R10) => T
): OutputParametricCachedSelector<S, P, T, (res1: R1, res2: R2, res3: R3, res4: R4, res5: R5, res6: R6,
            res7: R7, res8: R8, res9: R9, res10: R10) => T>;

/* eleven selectors */
export default function createCachedSelector<S, R1, R2, R3, R4, R5, R6, R7, R8, R9, R10, R11, T> (
  selector1: Selector<S, R1>,
  selector2: Selector<S, R2>,
  selector3: Selector<S, R3>,
  selector4: Selector<S, R4>,
  selector5: Selector<S, R5>,
  selector6: Selector<S, R6>,
  selector7: Selector<S, R7>,
  selector8: Selector<S, R8>,
  selector9: Selector<S, R9>,
  selector10: Selector<S, R10>,
  selector11: Selector<S, R11>,
  combiner: (res1: R1, res2: R2, res3: R3, res4: R4, res5: R5, res6: R6,
            res7: R7, res8: R8, res9: R9, res10: R10, res11: R11) => T
): OutputCachedSelector<S, T, (res1: R1, res2: R2, res3: R3, res4: R4, res5: R5, res6: R6,
            res7: R7, res8: R8, res9: R9, res10: R10, res11: R11) => T>;
export default function createCachedSelector<S, P, R1, R2, R3, R4, R5, R6, R7, R8, R9, R10, R11, T> (
  selector1: ParametricSelector<S, P, R1>,
  selector2: ParametricSelector<S, P, R2>,
  selector3: ParametricSelector<S, P, R3>,
  selector4: ParametricSelector<S, P, R4>,
  selector5: ParametricSelector<S, P, R5>,
  selector6: ParametricSelector<S, P, R6>,
  selector7: ParametricSelector<S, P, R7>,
  selector8: ParametricSelector<S, P, R8>,
  selector9: ParametricSelector<S, P, R9>,
  selector10: ParametricSelector<S, P, R10>,
  selector11: ParametricSelector<S, P, R11>,
  combiner: (res1: R1, res2: R2, res3: R3, res4: R4, res5: R5, res6: R6,
            res7: R7, res8: R8, res9: R9, res10: R10, res11: R11) => T
): OutputParametricCachedSelector<S, P, T, (res1: R1, res2: R2, res3: R3, res4: R4, res5: R5, res6: R6,
            res7: R7, res8: R8, res9: R9, res10: R10, res11: R11) => T>;

/* twelve selectors */
export default function createCachedSelector<S, R1, R2, R3, R4, R5, R6, R7, R8, R9, R10, R11, R12, T> (
  selector1: Selector<S, R1>,
  selector2: Selector<S, R2>,
  selector3: Selector<S, R3>,
  selector4: Selector<S, R4>,
  selector5: Selector<S, R5>,
  selector6: Selector<S, R6>,
  selector7: Selector<S, R7>,
  selector8: Selector<S, R8>,
  selector9: Selector<S, R9>,
  selector10: Selector<S, R10>,
  selector11: Selector<S, R11>,
  selector12: Selector<S, R12>,
  combiner: (res1: R1, res2: R2, res3: R3, res4: R4, res5: R5, res6: R6,
            res7: R7, res8: R8, res9: R9, res10: R10, res11: R11, res12: R12) => T
): OutputCachedSelector<S, T, (res1: R1, res2: R2, res3: R3, res4: R4, res5: R5, res6: R6,
            res7: R7, res8: R8, res9: R9, res10: R10, res11: R11, res12: R12) => T>;
export default function createCachedSelector<S, P, R1, R2, R3, R4, R5, R6, R7, R8, R9, R10, R11, R12, T> (
  selector1: ParametricSelector<S, P, R1>,
  selector2: ParametricSelector<S, P, R2>,
  selector3: ParametricSelector<S, P, R3>,
  selector4: ParametricSelector<S, P, R4>,
  selector5: ParametricSelector<S, P, R5>,
  selector6: ParametricSelector<S, P, R6>,
  selector7: ParametricSelector<S, P, R7>,
  selector8: ParametricSelector<S, P, R8>,
  selector9: ParametricSelector<S, P, R9>,
  selector10: ParametricSelector<S, P, R10>,
  selector11: ParametricSelector<S, P, R11>,
  selector12: ParametricSelector<S, P, R12>,
  combiner: (res1: R1, res2: R2, res3: R3, res4: R4, res5: R5, res6: R6,
            res7: R7, res8: R8, res9: R9, res10: R10, res11: R11, res12: R12) => T
): OutputParametricCachedSelector<S, P, T, (res1: R1, res2: R2, res3: R3, res4: R4, res5: R5, res6: R6,
            res7: R7, res8: R8, res9: R9, res10: R10, res11: R11, res12: R12) => T>;

/* array argument */

/* one selector */
export default function createCachedSelector<S, R1, T> (
  selectors: [Selector<S, R1>],
  combiner: (res: R1) => T
): OutputCachedSelector<S, T, (res: R1) => T>;
export default function createCachedSelector<S, P, R1, T> (
  selectors: [ParametricSelector<S, P, R1>],
  combiner: (res: R1) => T
): OutputParametricCachedSelector<S, P, T, (res: R1) => T>;

/* two selectors */
export default function createCachedSelector<S, R1, R2, T> (
  selectors: [Selector<S, R1>,
    Selector<S, R2>],
  combiner: (res1: R1, res2: R2) => T
): OutputCachedSelector<S, T, (res1: R1, res2: R2) => T>;
export default function createCachedSelector<S, P, R1, R2, T> (
  selectors: [ParametricSelector<S, P, R1>,
    ParametricSelector<S, P, R2>],
  combiner: (res1: R1, res2: R2) => T
): OutputParametricCachedSelector<S, P, T, (res1: R1, res2: R2) => T>;

/* three selectors */
export default function createCachedSelector<S, R1, R2, R3, T> (
  selectors: [Selector<S, R1>,
    Selector<S, R2>,
    Selector<S, R3>],
  combiner: (res1: R1, res2: R2, res3: R3) => T
): OutputCachedSelector<S, T, (res1: R1, res2: R2, res3: R3) => T>;
export default function createCachedSelector<S, P, R1, R2, R3, T> (
  selectors: [ParametricSelector<S, P, R1>,
    ParametricSelector<S, P, R2>,
    ParametricSelector<S, P, R3>],
  combiner: (res1: R1, res2: R2, res3: R3) => T
): OutputParametricCachedSelector<S, P, T, (res1: R1, res2: R2, res3: R3) => T>;

/* four selectors */
export default function createCachedSelector<S, R1, R2, R3, R4, T> (
  selectors: [Selector<S, R1>,
    Selector<S, R2>,
    Selector<S, R3>,
    Selector<S, R4>],
  combiner: (res1: R1, res2: R2, res3: R3, res4: R4) => T
): OutputCachedSelector<S, T, (res1: R1, res2: R2, res3: R3, res4: R4) => T>;
export default function createCachedSelector<S, P, R1, R2, R3, R4, T> (
  selectors: [ParametricSelector<S, P, R1>,
    ParametricSelector<S, P, R2>,
    ParametricSelector<S, P, R3>,
    ParametricSelector<S, P, R4>],
  combiner: (res1: R1, res2: R2, res3: R3, res4: R4) => T
): OutputParametricCachedSelector<S, P, T, (res1: R1, res2: R2, res3: R3, res4: R4) => T>;

/* five selectors */
export default function createCachedSelector<S, R1, R2, R3, R4, R5, T> (
  selectors: [Selector<S, R1>,
    Selector<S, R2>,
    Selector<S, R3>,
    Selector<S, R4>,
    Selector<S, R5>],
  combiner: (res1: R1, res2: R2, res3: R3, res4: R4, res5: R5) => T
): OutputCachedSelector<S, T, (res1: R1, res2: R2, res3: R3, res4: R4, res5: R5) => T>;
export default function createCachedSelector<S, P, R1, R2, R3, R4, R5, T> (
  selectors: [ParametricSelector<S, P, R1>,
    ParametricSelector<S, P, R2>,
    ParametricSelector<S, P, R3>,
    ParametricSelector<S, P, R4>,
    ParametricSelector<S, P, R5>],
  combiner: (res1: R1, res2: R2, res3: R3, res4: R4, res5: R5) => T
): OutputParametricCachedSelector<S, P, T, (res1: R1, res2: R2, res3: R3, res4: R4, res5: R5) => T>;

/* six selectors */
export default function createCachedSelector<S, R1, R2, R3, R4, R5, R6, T> (
  selectors: [Selector<S, R1>,
    Selector<S, R2>,
    Selector<S, R3>,
    Selector<S, R4>,
    Selector<S, R5>,
    Selector<S, R6>],
  combiner: (res1: R1, res2: R2, res3: R3, res4: R4, res5: R5, res6: R6) => T
): OutputCachedSelector<S, T, (res1: R1, res2: R2, res3: R3, res4: R4, res5: R5, res6: R6) => T>;
export default function createCachedSelector<S, P, R1, R2, R3, R4, R5, R6, T> (
  selectors: [ParametricSelector<S, P, R1>,
    ParametricSelector<S, P, R2>,
    ParametricSelector<S, P, R3>,
    ParametricSelector<S, P, R4>,
    ParametricSelector<S, P, R5>,
    ParametricSelector<S, P, R6>],
  combiner: (res1: R1, res2: R2, res3: R3, res4: R4, res5: R5, res6: R6) => T
): OutputParametricCachedSelector<S, P, T, (res1: R1, res2: R2, res3: R3, res4: R4, res5: R5, res6: R6) => T>;

/* seven selectors */
export default function createCachedSelector<S, R1, R2, R3, R4, R5, R6, R7, T> (
  selectors: [Selector<S, R1>,
    Selector<S, R2>,
    Selector<S, R3>,
    Selector<S, R4>,
    Selector<S, R5>,
    Selector<S, R6>,
    Selector<S, R7>],
  combiner: (res1: R1, res2: R2, res3: R3, res4: R4, res5: R5, res6: R6,
            res7: R7) => T
): OutputCachedSelector<S, T, (res1: R1, res2: R2, res3: R3, res4: R4, res5: R5, res6: R6,
            res7: R7) => T>;
export default function createCachedSelector<S, P, R1, R2, R3, R4, R5, R6, R7, T> (
  selectors: [ParametricSelector<S, P, R1>,
    ParametricSelector<S, P, R2>,
    ParametricSelector<S, P, R3>,
    ParametricSelector<S, P, R4>,
    ParametricSelector<S, P, R5>,
    ParametricSelector<S, P, R6>,
    ParametricSelector<S, P, R7>],
  combiner: (res1: R1, res2: R2, res3: R3, res4: R4, res5: R5, res6: R6,
            res7: R7) => T
): OutputParametricCachedSelector<S, P, T, (res1: R1, res2: R2, res3: R3, res4: R4, res5: R5, res6: R6,
            res7: R7) => T>;

/* eight selectors */
export default function createCachedSelector<S, R1, R2, R3, R4, R5, R6, R7, R8, T> (
  selectors: [Selector<S, R1>,
    Selector<S, R2>,
    Selector<S, R3>,
    Selector<S, R4>,
    Selector<S, R5>,
    Selector<S, R6>,
    Selector<S, R7>,
    Selector<S, R8>],
  combiner: (res1: R1, res2: R2, res3: R3, res4: R4, res5: R5, res6: R6,
            res7: R7, res8: R8) => T
): OutputCachedSelector<S, T, (res1: R1, res2: R2, res3: R3, res4: R4, res5: R5, res6: R6,
            res7: R7, res8: R8) => T>;
export default function createCachedSelector<S, P, R1, R2, R3, R4, R5, R6, R7, R8, T> (
  selectors: [ParametricSelector<S, P, R1>,
    ParametricSelector<S, P, R2>,
    ParametricSelector<S, P, R3>,
    ParametricSelector<S, P, R4>,
    ParametricSelector<S, P, R5>,
    ParametricSelector<S, P, R6>,
    ParametricSelector<S, P, R7>,
    ParametricSelector<S, P, R8>],
  combiner: (res1: R1, res2: R2, res3: R3, res4: R4, res5: R5, res6: R6,
            res7: R7, res8: R8) => T
): OutputParametricCachedSelector<S, P, T, (res1: R1, res2: R2, res3: R3, res4: R4, res5: R5, res6: R6,
            res7: R7, res8: R8) => T>;

/* nine selectors */
export default function createCachedSelector<S, R1, R2, R3, R4, R5, R6, R7, R8, R9, T> (
  selectors: [Selector<S, R1>,
    Selector<S, R2>,
    Selector<S, R3>,
    Selector<S, R4>,
    Selector<S, R5>,
    Selector<S, R6>,
    Selector<S, R7>,
    Selector<S, R8>,
    Selector<S, R9>],
  combiner: (res1: R1, res2: R2, res3: R3, res4: R4, res5: R5, res6: R6,
            res7: R7, res8: R8, res9: R9) => T
): OutputCachedSelector<S, T, (res1: R1, res2: R2, res3: R3, res4: R4, res5: R5, res6: R6,
            res7: R7, res8: R8, res9: R9) => T>;
export default function createCachedSelector<S, P, R1, R2, R3, R4, R5, R6, R7, R8, R9, T> (
  selectors: [ParametricSelector<S, P, R1>,
    ParametricSelector<S, P, R2>,
    ParametricSelector<S, P, R3>,
    ParametricSelector<S, P, R4>,
    ParametricSelector<S, P, R5>,
    ParametricSelector<S, P, R6>,
    ParametricSelector<S, P, R7>,
    ParametricSelector<S, P, R8>,
    ParametricSelector<S, P, R9>],
  combiner: (res1: R1, res2: R2, res3: R3, res4: R4, res5: R5, res6: R6,
            res7: R7, res8: R8, res9: R9) => T
): OutputParametricCachedSelector<S, P, T, (res1: R1, res2: R2, res3: R3, res4: R4, res5: R5, res6: R6,
            res7: R7, res8: R8, res9: R9) => T>;

/* ten selectors */
export default function createCachedSelector<S, R1, R2, R3, R4, R5, R6, R7, R8, R9, R10, T> (
  selectors: [Selector<S, R1>,
    Selector<S, R2>,
    Selector<S, R3>,
    Selector<S, R4>,
    Selector<S, R5>,
    Selector<S, R6>,
    Selector<S, R7>,
    Selector<S, R8>,
    Selector<S, R9>,
    Selector<S, R10>],
  combiner: (res1: R1, res2: R2, res3: R3, res4: R4, res5: R5, res6: R6,
            res7: R7, res8: R8, res9: R9, res10: R10) => T
): OutputCachedSelector<S, T, (res1: R1, res2: R2, res3: R3, res4: R4, res5: R5, res6: R6,
            res7: R7, res8: R8, res9: R9, res10: R10) => T>;
export default function createCachedSelector<S, P, R1, R2, R3, R4, R5, R6, R7, R8, R9, R10, T> (
  selectors: [ParametricSelector<S, P, R1>,
    ParametricSelector<S, P, R2>,
    ParametricSelector<S, P, R3>,
    ParametricSelector<S, P, R4>,
    ParametricSelector<S, P, R5>,
    ParametricSelector<S, P, R6>,
    ParametricSelector<S, P, R7>,
    ParametricSelector<S, P, R8>,
    ParametricSelector<S, P, R9>,
    ParametricSelector<S, P, R10>],
  combiner: (res1: R1, res2: R2, res3: R3, res4: R4, res5: R5, res6: R6,
            res7: R7, res8: R8, res9: R9, res10: R10) => T
): OutputParametricCachedSelector<S, P, T, (res1: R1, res2: R2, res3: R3, res4: R4, res5: R5, res6: R6,
            res7: R7, res8: R8, res9: R9, res10: R10) => T>;

/* eleven selectors */
export default function createCachedSelector<S, R1, R2, R3, R4, R5, R6, R7, R8, R9, R10, R11, T> (
  selectors: [Selector<S, R1>,
    Selector<S, R2>,
    Selector<S, R3>,
    Selector<S, R4>,
    Selector<S, R5>,
    Selector<S, R6>,
    Selector<S, R7>,
    Selector<S, R8>,
    Selector<S, R9>,
    Selector<S, R10>,
    Selector<S, R11>],
  combiner: (res1: R1, res2: R2, res3: R3, res4: R4, res5: R5, res6: R6,
            res7: R7, res8: R8, res9: R9, res10: R10, res11: R11) => T
): OutputCachedSelector<S, T, (res1: R1, res2: R2, res3: R3, res4: R4, res5: R5, res6: R6,
            res7: R7, res8: R8, res9: R9, res10: R10, res11: R11) => T>;
export default function createCachedSelector<S, P, R1, R2, R3, R4, R5, R6, R7, R8, R9, R10, R11, T> (
  selectors: [ParametricSelector<S, P, R1>,
    ParametricSelector<S, P, R2>,
    ParametricSelector<S, P, R3>,
    ParametricSelector<S, P, R4>,
    ParametricSelector<S, P, R5>,
    ParametricSelector<S, P, R6>,
    ParametricSelector<S, P, R7>,
    ParametricSelector<S, P, R8>,
    ParametricSelector<S, P, R9>,
    ParametricSelector<S, P, R10>,
    ParametricSelector<S, P, R11>],
  combiner: (res1: R1, res2: R2, res3: R3, res4: R4, res5: R5, res6: R6,
            res7: R7, res8: R8, res9: R9, res10: R10, res11: R11) => T
): OutputParametricCachedSelector<S, P, T, (res1: R1, res2: R2, res3: R3, res4: R4, res5: R5, res6: R6,
            res7: R7, res8: R8, res9: R9, res10: R10, res11: R11) => T>;

/* twelve selectors */
export default function createCachedSelector<S, R1, R2, R3, R4, R5, R6, R7, R8, R9, R10, R11, R12, T> (
  selectors: [Selector<S, R1>,
    Selector<S, R2>,
    Selector<S, R3>,
    Selector<S, R4>,
    Selector<S, R5>,
    Selector<S, R6>,
    Selector<S, R7>,
    Selector<S, R8>,
    Selector<S, R9>,
    Selector<S, R10>,
    Selector<S, R11>,
    Selector<S, R12>],
  combiner: (res1: R1, res2: R2, res3: R3, res4: R4, res5: R5, res6: R6,
            res7: R7, res8: R8, res9: R9, res10: R10, res11: R11, res12: R12) => T
): OutputCachedSelector<S, T, (res1: R1, res2: R2, res3: R3, res4: R4, res5: R5, res6: R6,
            res7: R7, res8: R8, res9: R9, res10: R10, res11: R11, res12: R12) => T>;
export default function createCachedSelector<S, P, R1, R2, R3, R4, R5, R6, R7, R8, R9, R10, R11, R12, T> (
  selectors: [ParametricSelector<S, P, R1>,
    ParametricSelector<S, P, R2>,
    ParametricSelector<S, P, R3>,
    ParametricSelector<S, P, R4>,
    ParametricSelector<S, P, R5>,
    ParametricSelector<S, P, R6>,
    ParametricSelector<S, P, R7>,
    ParametricSelector<S, P, R8>,
    ParametricSelector<S, P, R9>,
    ParametricSelector<S, P, R10>,
    ParametricSelector<S, P, R11>,
    ParametricSelector<S, P, R12>],
  combiner: (res1: R1, res2: R2, res3: R3, res4: R4, res5: R5, res6: R6,
            res7: R7, res8: R8, res9: R9, res10: R10, res11: R11, res12: R12) => T
): OutputParametricCachedSelector<S, P, T, (res1: R1, res2: R2, res3: R3, res4: R4, res5: R5, res6: R6,
            res7: R7, res8: R8, res9: R9, res10: R10, res11: R11, res12: R12) => T>;

export interface ICacheObject {
  set (key: any, selectorFn: any): void;
  get (key: any): any;
  remove (key: any): void;
  clear (): void;
}

export class FlatCacheObject implements ICacheObject {
  set (key: string|number, selectorFn: any): void;
  get (key: string|number): any;
  remove (key: string|number): void;
  clear (): void;
  isValidCacheKey (): boolean;
}

export class FifoCacheObject implements ICacheObject {
  constructor (options: { cacheSize: number });
  set (key: string|number, selectorFn: any): void;
  get (key: string|number): any;
  remove (key: string|number): void;
  clear (): void;
  isValidCacheKey (): boolean;
}

export class LruCacheObject implements ICacheObject {
  constructor (options: { cacheSize: number });
  set (key: string|number, selectorFn: any): void;
  get (key: string|number): any;
  remove (key: string|number): void;
  clear (): void;
  isValidCacheKey (): boolean;
}

export class FlatMapCacheObject implements ICacheObject {
  set (key: any, selectorFn: any): void;
  get (key: any): any;
  remove (key: any): void;
  clear (): void;
}

export class FifoMapCacheObject implements ICacheObject {
  constructor (options: { cacheSize: number });
  set (key: any, selectorFn: any): void;
  get (key: any): any;
  remove (key: any): void;
  clear (): void;
}

export class LruMapCacheObject implements ICacheObject {
  constructor (options: { cacheSize: number });
  set (key: any, selectorFn: any): void;
  get (key: any): any;
  remove (key: any): void;
  clear (): void;
}
