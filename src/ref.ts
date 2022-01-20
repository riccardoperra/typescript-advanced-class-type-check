import { Component, TupleSelect } from "./helpers";

declare const tag: unique symbol;
export type Opaque<T, Token = unknown> = T & { [tag]: Token };
export type Ref<T> = Opaque<T, "Ref">;

export type ExtractRefs<T extends readonly unknown[]> = {
  [key in keyof T]: T[key] extends Ref<infer U> ? U : never;
}[number];

export type GetRef<T extends Ref<unknown> | undefined> = T extends Ref<infer U>
  ? U
  : never;

export type GetRefsFromConstructor<T extends Component<unknown>> = TupleSelect<
  ConstructorParameters<T>,
  Ref<unknown>
>;

export type StrictComponent<T extends Component<unknown>> =
  GetRefsFromConstructor<T> extends []
    ? never
    : GetRefsFromConstructor<T>[0] extends Ref<unknown>
    ? T
    : never;

export type Output<T extends Component<unknown>> =
  GetRefsFromConstructor<T>["length"] extends 0 // Empty
    ? never
    : GetRefsFromConstructor<T>["length"] extends 1 // Take first element
    ? GetRef<GetRefsFromConstructor<T>[0]>
    : ExtractRefs<GetRefsFromConstructor<T>>;

export declare function foo<T extends Component<unknown>>(
  cmp: StrictComponent<T>
): Output<T>;
