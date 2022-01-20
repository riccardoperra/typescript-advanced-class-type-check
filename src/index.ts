import { Test } from "ts-toolbelt";
import { TupleToUnion } from "./helpers";
import {
  ExtractRefs,
  GetRefsFromConstructor,
  Output,
  Ref,
  StrictComponent,
} from "./ref";
import {
  _GetRefsFromConstructor,
  _Output,
  _StrictComponent,
} from "./ref-tstoolbelt";

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

const { checks, check } = Test;

///
/// ExtractRefs
///

type ExtractRefInput = [Ref<string>, Ref<number>, Ref<Ref<string>>];
type ExtractRefResult = string | number | Ref<string>;

checks([check<ExtractRefs<ExtractRefInput>, ExtractRefResult, Test.Pass>()]);

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
  check<Output<typeof TestWithAny>, symbol, Test.Pass>(),

  check<_Output<typeof TestWorking>, symbol, Test.Pass>(),
  check<
    _Output<typeof MultipleTestWorking>,
    symbol | string | Ref<string>,
    Test.Pass
  >(),
  check<_Output<typeof TestError>, never, Test.Pass>(),
  check<_Output<typeof TestError2>, never, Test.Pass>(),
  check<_Output<typeof TestWithUnknown>, symbol, Test.Pass>(),
  check<_Output<typeof TestWithAny>, symbol, Test.Pass>(),
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
  check<StrictComponent<typeof TestWithAny>, typeof TestWithAny, Test.Pass>(),

  check<_StrictComponent<typeof TestWorking>, typeof TestWorking, Test.Pass>(),
  check<_StrictComponent<typeof TestError>, typeof TestError, Test.Fail>(),
  check<_StrictComponent<typeof TestError2>, typeof TestError2, Test.Fail>(),
  check<
    _StrictComponent<typeof TestWithUnknown>,
    typeof TestWithUnknown,
    Test.Pass
  >(),
  check<_StrictComponent<typeof TestWithAny>, typeof TestWithAny, Test.Pass>(),
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
  check<GetRefsFromConstructor<typeof TestWithAny>, [Ref<symbol>], Test.Pass>(),

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
  check<_GetRefsFromConstructor<typeof TestError2>, [], Test.Pass>(),
  check<
    _GetRefsFromConstructor<typeof TestWithAny>,
    [Ref<symbol>],
    Test.Pass
  >(),
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
    Ref<number> | Ref<string>,
    Test.Pass
  >(),
]);
