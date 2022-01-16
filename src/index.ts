import { Test } from "ts-toolbelt";
import { TupleToUnion } from "./helper";
import {
  foo,
  GetRefsFromConstructor,
  Output,
  Ref,
  ExtractRefs,
  StrictComponent
} from "./ref";
import {
  _Output,
  _StrictComponent,
  _GetRefsFromConstructor,
  fooTsToolbelt
} from "./ref-v2";

export class TestWorking {
  constructor(
    private readonly p1: string,
    private readonly p3: Ref<symbol>,
    private readonly p2: number
  ) {}
}

export class MultipleTestWorking {
  constructor(
    private readonly p3: Ref<symbol>,
    private readonly p1: string,
    private readonly p2: Ref<string>,
    private readonly p4: Ref<Ref<string>>
  ) {}
}

export class TestError {
  constructor(
    private readonly p1: string,
    private readonly p2: number,
    private readonly p4: 1
  ) {}
}

export class TestWithUnknown {
  constructor(
    private readonly p2: Ref<symbol>,
    private readonly p3: string,
    private readonly p4: unknown
  ) {}
}

export class TestWithAny {
  constructor(private readonly p2: Ref<symbol>, private readonly p1: any) {}
}

export class TestError2 {
  constructor(
    private readonly p1: {},
    private readonly p2: { test: string },
    private readonly p4: { dialogData: number }
  ) {}
}

const a = foo(TestWorking);
const b = foo(MultipleTestWorking);
const c = foo(TestError);
const d = foo(TestError2);
const e = foo(TestWithUnknown);
const f = foo(TestWithAny);

const a1 = fooTsToolbelt(TestWorking);
const b1 = fooTsToolbelt(MultipleTestWorking);
const c1 = fooTsToolbelt(TestError);
const d1 = fooTsToolbelt(TestError2);
const e1 = fooTsToolbelt(TestWithUnknown);
const f1 = fooTsToolbelt(TestWithAny);

const { checks, check } = Test;

///
/// ExtractRefs
///

type ExtractRefInput = [Ref<string>, Ref<number>, Ref<Ref<string>>];
type ExtractRefResult = string | number | Ref<string>;

checks([check<ExtractRefs<ExtractRefInput>, ExtractRefResult, Test.Pass>()]);

///
/// TYPEOF RESULT TEST
///

type ResultA = symbol;
type ResultB = string | symbol | Ref<string>;
type ResultC = never;
type ResultD = never;
type ResultE = symbol;
type ResultF = symbol;

checks([
  check<typeof a, ResultA, Test.Pass>(),
  check<typeof b, ResultB, Test.Pass>(),
  check<typeof c, ResultC, Test.Pass>(),
  check<typeof d, ResultD, Test.Pass>(),
  check<typeof e, ResultE, Test.Pass>(),
  check<typeof f, ResultF, Test.Pass>(),

  check<typeof a1, ResultA, Test.Pass>(),
  check<typeof b1, ResultB, Test.Pass>(),
  check<typeof c1, ResultC, Test.Pass>(),
  check<typeof d1, ResultD, Test.Pass>(),
  check<typeof e1, ResultE, Test.Pass>(),
  check<typeof f1, ResultF, Test.Pass>()
]);

///
/// OUTPUT
///

checks([
  check<Output<typeof TestWorking>, symbol, Test.Pass>(),
  check<
    Output<typeof MultipleTestWorking>,
    symbol | string | Ref<string>,
    Test.Pass
  >(),
  check<Output<typeof TestError>, never, Test.Pass>(),
  check<Output<typeof TestError2>, never, Test.Pass>(),
  check<Output<typeof TestWithUnknown>, symbol, Test.Pass>(),

  check<_Output<typeof TestWorking>, symbol, Test.Pass>(),
  check<
    _Output<typeof MultipleTestWorking>,
    symbol | string | Ref<string>,
    Test.Pass
  >(),
  check<_Output<typeof TestError>, never, Test.Pass>(),
  check<_Output<typeof TestError2>, never, Test.Pass>(),
  check<_Output<typeof TestWithUnknown>, symbol, Test.Pass>()
]);

///
/// StrictComponent / _StrictComponent
///

checks([
  check<StrictComponent<typeof TestWorking>, typeof TestWorking, Test.Pass>(),
  check<StrictComponent<typeof TestError>, typeof TestError, Test.Fail>(),
  check<StrictComponent<typeof TestError2>, typeof TestError2, Test.Fail>(),
  check<
    StrictComponent<typeof TestWithUnknown>,
    typeof TestWithUnknown,
    Test.Pass
  >(),

  check<_StrictComponent<typeof TestWorking>, typeof TestWorking, Test.Pass>(),
  check<_StrictComponent<typeof TestError>, typeof TestError, Test.Fail>(),
  check<_StrictComponent<typeof TestError2>, typeof TestError2, Test.Fail>(),
  check<
    _StrictComponent<typeof TestWithUnknown>,
    typeof TestWithUnknown,
    Test.Pass
  >()
]);

///
/// GetRefsFromConstructor / _GetRefsFromConstructor
///

checks([
  check<GetRefsFromConstructor<typeof TestWorking>, [Ref<symbol>], Test.Pass>(),
  check<
    GetRefsFromConstructor<typeof MultipleTestWorking>,
    [Ref<symbol>, Ref<string>, Ref<Ref<string>>],
    Test.Pass
  >(),
  check<GetRefsFromConstructor<typeof TestError>, [], Test.Pass>(),
  check<GetRefsFromConstructor<typeof TestError2>, [], Test.Pass>(),

  check<
    _GetRefsFromConstructor<typeof TestWorking>,
    [Ref<symbol>],
    Test.Pass
  >(),
  check<
    _GetRefsFromConstructor<typeof MultipleTestWorking>,
    [Ref<symbol>, Ref<string>, Ref<Ref<string>>],
    Test.Pass
  >(),
  check<_GetRefsFromConstructor<typeof TestError>, [], Test.Pass>(),
  check<_GetRefsFromConstructor<typeof TestError2>, [], Test.Pass>()
]);

///
/// Tuple to Union
///

checks([
  check<
    TupleToUnion<[string, number, symbol]>,
    string | number | symbol,
    Test.Pass
  >(),
  check<
    TupleToUnion<[Ref<string>, Ref<number>, Ref<Ref<string>>]>,
    Ref<string> | Ref<number> | Ref<string>,
    Test.Pass
  >()
]);
