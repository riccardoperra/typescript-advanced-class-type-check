import { Any, List } from "ts-toolbelt";
import { Component, _TupleSelect } from "./helpers";
import { ExtractRefs, GetRef, Ref } from "./ref";

export type _GetRefsFromConstructor<T extends Component<unknown>> =
  _TupleSelect<ConstructorParameters<T>, Ref<unknown>>;

export type _StrictComponent<T extends Component<unknown>> = List.Length<
  _GetRefsFromConstructor<T>
> extends 0
  ? never
  : Any.Try<List.Head<_GetRefsFromConstructor<T>>, never, T>;

type _ExtractOutput<T extends readonly Ref<unknown>[]> =
  List.Length<T> extends 0
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
