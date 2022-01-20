import { List } from "ts-toolbelt";

export interface Component<T> extends Function {
  new (...args: any[]): T;
}

/**
 * @param T is the type of the object that is being iterated over.
 * @param U is the type to match on each iteration
 *
 * @returns a tuple that contains only the values that match the type U.
 * This type is necessary since `any`, `never` and `unknown` must be excluded.
 */
export type _ExtractSafeTupleValues<T extends readonly unknown[], U> = {
  [key in keyof T]: T[key] extends IsNotAny<T[key]>
    ? T[key] extends U
      ? T[key]
      : [never]
    : [never];
};

/**
 * @param T is the type of the object that is being iterated over.
 * @param Match is the type that will be included in the tuple.
 * @returns a tuple that contains only the values that match the type Match.
 */
export type TupleSelect<
  T extends readonly unknown[],
  Match
> = _ExtractSafeTupleValues<T, Match> extends [infer Head, ...infer O]
  ? [Head] extends [Match]
    ? [Head, ...TupleSelect<O, Match>]
    : TupleSelect<O, Match>
  : [];

/**
 * @link TupleSelect
 * ts-toolbelt version of TupleSelect
 */
export type _TupleSelect<T extends readonly unknown[], Match> = List.Select<
  _ExtractSafeTupleValues<T, Match>,
  Match
>;

type IsNotAny<T> = unknown extends T
  ? [keyof T] extends [never]
    ? T
    : never
  : T;
