import { List } from "ts-toolbelt";

export interface Component<T> extends Function {
  new (...args: any[]): T;
}

type IsTypeToExtract<T extends unknown, TypeToExtract> = IsNever<T> extends true
  ? false
  : IsAny<T> extends true
  ? false
  : [T] extends [TypeToExtract]
  ? true
  : false;

export type TupleFilterBy<
  T extends readonly unknown[],
  TypeToExtract
> = T extends [infer Head, ...(infer O)]
  ? IsTypeToExtract<Head, TypeToExtract> extends true
    ? [Head, ...TupleFilterBy<O, TypeToExtract>]
    : TupleFilterBy<O, TypeToExtract>
  : [];

export type _TupleFilterBy<T extends readonly unknown[], Match> = List.Select<
  T,
  // TODO: fix [any] type
  Match
>;

export type TupleToUnion<T extends readonly unknown[]> = T[number];

declare const tag: unique symbol;
export type Opaque<T, Token = unknown> = T & {
  [tag]: Token;
};

export type IsAny<T> = (T extends never ? true : false) extends false
  ? false
  : true;

export type IsNever<T> = T extends never ? true : false;
export type IsUnknown<T> = [T] extends [unknown] ? never : T;
