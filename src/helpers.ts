import { List } from "ts-toolbelt";

export interface Component<T> extends Function {
  new (...args: any[]): T;
}

export type _ExtractSafeTupleValues<T extends readonly unknown[], U> = {
  [key in keyof T]: T[key] extends IsNotAny<T[key]>
    ? T[key] extends U
      ? T[key]
      : [never]
    : [never];
};

export type TupleSelect<
  T extends readonly unknown[],
  Match
> = _ExtractSafeTupleValues<T, Match> extends [infer Head, ...infer O]
  ? [Head] extends [Match]
    ? [Head, ...TupleSelect<O, Match>]
    : TupleSelect<O, Match>
  : [];

export type _TupleSelect<T extends readonly unknown[], Match> = List.Select<
  _ExtractSafeTupleValues<T, Match>,
  Match
>;

export type TupleToUnion<T extends readonly unknown[]> = T[number];

type IsNotAny<T> = unknown extends T
  ? [keyof T] extends [never]
    ? T
    : never
  : T;
