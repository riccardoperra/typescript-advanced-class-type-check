import { List } from "ts-toolbelt";

export interface Component<T> extends Function {
  new (...args: any[]): T;
}

export type TupleFilterBy<
  T extends readonly unknown[],
  TypeToExtract
> = T extends [infer Head, ...(infer O)]
  ? [Head] extends [TypeToExtract]
    ? [Head, ...TupleFilterBy<O, TypeToExtract>]
    : TupleFilterBy<O, TypeToExtract>
  : [];

export type _TupleFilterBy<T extends readonly unknown[], Match> = List.Select<
  T,
  Match
>;

export type TupleToUnion<T extends readonly unknown[]> = T[number];

declare const tag: unique symbol;
export type Opaque<T, Token = unknown> = T & {
  [tag]: Token;
};
