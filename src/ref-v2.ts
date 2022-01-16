import { Any, List } from "ts-toolbelt";
import { Component, _TupleFilterBy } from "./helper";
import { ExtractRefs, GetRef, Ref } from "./ref";

// Workaround
// type ExtractRefs<T extends Ref<unknown>[]> = T[number] extends Ref<infer U> ? U : never;
// const T = (list: Ref<unknown>[], index = 0, acc = unknown[]) => {
//   list.length === index
//     ? acc
//     : ref(list, index + 1, [...acc, list[index]])
// }
//
// export type _ExtractRefs<
//   RefsList extends readonly Ref<unknown>[],
//   CurrentIndex extends RefsList["length"] = 0,
//   Accumulator extends readonly unknown[] = []
// > = CurrentIndex extends List.Length<RefsList>
//   ? Accumulator[number]
//   : _ExtractRefs<
//       RefsList,
//       Number.Add<CurrentIndex, 1>,
//       RefsList[CurrentIndex] extends Ref<infer U>
//         ? List.Append<Accumulator, U>
//         : Accumulator
//     >;

export type _GetRefsFromConstructor<
  T extends Component<unknown>
> = _TupleFilterBy<ConstructorParameters<T>, Ref<unknown>>;

export type _StrictComponent<T extends Component<unknown>> = List.Length<
  _GetRefsFromConstructor<T>
> extends 0
  ? never
  : Any.Try<List.Head<_GetRefsFromConstructor<T>>, never, T>;

type _ExtractOutput<T extends readonly Ref<unknown>[]> = List.Length<
  T
> extends 0
  ? never
  : List.Length<T> extends 1
  ? GetRef<List.Head<T>>
  : ExtractRefs<T>;

export type _Output<T extends Component<unknown>> = _ExtractOutput<
  _GetRefsFromConstructor<T>
>;

export declare function fooTsToolbelt<T extends Component<unknown>>(
  cmp: _StrictComponent<T>
): _Output<T>;
