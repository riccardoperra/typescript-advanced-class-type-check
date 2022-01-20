> # Typescript advanced type-check
> ### Constructor parameter constraint

## Table of contents

- [Introduction](#introduction)
- [Getting started](#getting-started)
- [Explanation](#explanation)
- [Advanced Cases](#advanced-cases)
- [Conclusion](#conclusion)

## Introduction

Sometimes it may be necessary to apply a type constraint so that it is possible to pass a class that has at least a
certain type in its constructor.

A real case for example is using Angular especially with libraries that make use of dynamic component rendering.

Think about the latest portal, toast, dialog libraries that have come out. Most, if not all, do not have strong typing
regarding the use of injected contexts, component instances, or for example the result of the confirm button of a
dialog.

This repository aims to cover a base scenario that can be extended to be able to correctly type values

<strong>Warning!</strong> A strong knowledge of typescript is required to better understand the concept, as the
following explanation will cover these points:

- [Type inference](https://www.typescriptlang.org/docs/handbook/type-inference.html)
- [Conditional types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)
- [Distributive conditional types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#distributive-conditional-types)
- [Variadic tuple types](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-0.html)
- Recursive types

## Getting started

[Open in codesandbox](https://codesandbox.io/s/github/riccardoperra/ts-advanced-constructor-type-check)

Run on your machine:

- Install dependencies
    ```bash 
    yarn install
    ```
- Run tests
    ```bash 
    npm run test:watch
    ```
- Run the server with test html result
    ```bash 
    npm run start
    ```

## Explanation

Our goal is to create a stricter type than `Constructor<T>`, because we want that the given class <strong>must
contains</strong>
`Example` type property as <strong>one of</strong> constructor parameter.

```ts
declare function foo<T extends Constructor<unknown>>(
  classConstructor: StrictConstructor<T>
): Output<T>;

// Foo class instance
const result = foo(Foo);
// Argument of type `typeof FooBad` is not assignable to parameter of type never.
const result2 = foo(FooBad);
```

First, we need to define a utility type that a defines a class constructor. Our function will take a class as parameter
and return an output type.

```ts
type Constructor<T> = new (...args: any[]) => T;
type Output<T extends Constructor<T>> = InstanceType<T>;

declare function foo<T extends Constructor<unknown>>(
  classConstructor: T
): Output<T>;

class Foo {
  constructor(p1: string, p2: number, p3: {}) {
  }
}

const result = foo(Foo);
// Result is instance of Foo
```

Next, we need to get the constructor parameters of the class. This could be done using the Typescript built-in utility
function `ConstructorParameters`, extremely useful because it returns
a [tuple type](https://www.typescriptlang.org/docs/handbook/2/objects.html#tuple-types).

```ts
class Foo {
  constructor(p1: string, p2: number, p3: symbol) {
  }
}

// [p1: string, p2: number, p3: symbol]
type Parameters = ConstructorParameters<typeof Foo>;
```

The best part is this. We have to take the tuple that we got before, so we can create a new tuple that only contains the
properties with the Example interface. This is like an array`.filter()`

This could be a simple ts implementation, but we need to do it with types.

```ts
function tupleSelect<T>(acc: T[], matchFn: (value: T) => boolean) {
  const [head, ...tail] = acc;
  if (!head || tail.length === 0) {
    return acc;
  }
  return matchFn(head)
    ? [head, ...tupleSelect(tail, matchFn)]
    : tupleSelect(tail, matchFn);
}
```

Before TS 4.1, overloading could have been the best choice (have you ever
seen [reselect](https://github.com/reduxjs/reselect/blob/master/src/typesVersions/ts4.1/index.d.ts)?), but with the
newest implementation
of [variadic tuple types](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-0.html), recursive
types support and conditionals types we can handle it with a <strong>simple</strong> custom type 😇.

```ts
export type TupleSelect<T extends readonly unknown[],
  Match> = // Our array extends a tuple, it obviously passes. We need only to use the infer keyword to take the head and the tail
  T extends [infer Head, ...infer Tail]
    ? // If Head === Match
    [Head] extends [Match]
      ? // Creates a new tuple with the head, and recursively do the selection
      // with the rest of the array
      [Head, ...TupleSelect<Tail, Match>]
      : // Otherwise returns the tail: our head is not the type we are looking for
      TupleSelect<Tail, Match>
    : [];
```

That's it! Now we can filter out the properties that don't match our type.

```ts
interface Example<T> {
}

class Foo {
  constructor(p1: string, p2: number, p3: symbol, p4: string) {
  }
}

// [p1: string, p2: number, p3: symbol, string]
type Parameters = ConstructorParameters<typeof Foo>;
// [p1: string, p4: string]
type OnlyStringParameters = TupleSelect<Parameters, string>;
```

At the last step, we have to create the type that apply the constraint to our class constructor: if the `TupleSelect`
result is an empty array, we can return `never`, otherwise we can return the right constructor type.

```ts
class Foo {
  constructor(p1: string, p2: number) {
  }
}

// [p2: number]
type AllowedParameters<T> = TupleSelect<ConstructorParameters<T>, number>;
// If the length of our constructor is 0, we can return `never`, so the compilation will fail if we pass a bad class.
// Actually the length is 1
type StrictConstructor<T> = AllowedParameters<T>["length"] extends 0
  ? never
  : T;
```

Finally, we can put the `Example` type constraint to our function parameter :D.

```ts
class Example<T> {
}

type AllowedParameters<T> = TupleSelect<ConstructorParameters<T>,
  Example<unknown>>;

type StrictConstructor<T> = AllowedParameters<T>["length"] extends 0
  ? never
  : T;

declare function foo<T extends Constructor<unknown>>(
  classConstructor: StrictConstructor<T>
): InstanceType<T>;

class Foo {
  constructor(p1: string, p2: number, p3: Example<string>) {
  }
}

class FooBad {
  constructor(p1: string, p2: number) {
  }
}

// Foo class instance
const result = foo(Foo);
// Argument of type `typeof FooBad` is not assignable to parameter of type never.
const result2 = foo(FooBad);
```

## Advanced cases

The previous explanation didn't cover the cases where we need to filter an Interface. Also, what happens if the tuple of
the passed parameters has `any`, `never` or `unknown` types? What about if the tuple has more than one element?

Let's see the first problem: the `Interface`, or an object type.

### Opaque types

```ts
import { TupleSelect } from "./helpers";

interface A {
}

interface B {
}

type C = { p2: string };
D = { p1: string };

class Foo {
  constructor(readonly a: A, readonly b: B, readonly c: C, readonly d: D) {
  }
}

// Result: [a: A, b: B, c: C, d: D]
type Filtered = TupleSelect<ConstructorParameters<typeof Foo>, A>
```

If we try to filter out type A from here, we will get back a tuple which contains all the properties. This is because
the type A is an empty interface, and it extends another empty interface (even if it has a different name), or an object
type that has some properties inside.

To solve, we need to make our interface unique, and this is possible with the `Opaque` type. It's nothing complicated,
but it allows us to unify our interface.

```ts
declare const tag: unique symbol;
export type Opaque<T, Token = unknown> = T & { [tag]: Token };

interface _A {
}

export type A = Opaque<_A, 'A'>;
```

The magic happens thanks to the constant tag that we declare, but that we don't export. This way the [tag] property will
not really be recognized, but we actually have a unique type of its kind.

### Handle tuple with different length

We predicted the case where the length was 0, when the tuple was empty, so that in the other case we would get our
correct type. What if you have more than one value? In this case we can decide to return the union of types, with a
simple `TupleToUnion` type.

```ts
export type TupleToUnion<T extends readonly unknown[]> = {
  [key in keyof T]: T[key] extends U ? U : never;
}[number];

type A = [string, number];
// string | number
type B = TupleToUnion<A>;
// Conditional type
type C = A['length'] extends 0
  ? never
  : A['length'] extends 1
    ? A[0]
    : TupleToUnion<A>;
```

### Exclude `any`,  `never`, `unknown`

The last remaining problem concerns the inference of `any`, `never` and `unknown` types. This is because a type T could
always extend any or unknown, so we have to anticipate the cases when we use conditional types.

```ts
export type GetAllowedTupleValues<T extends readonly unknown[], U> = {
  [key in keyof T]: T[key] extends IsNotAny<T[key]>
    ? T[key] extends U
      ? T[key]
      : [never]
    : [never];
};

type IsNotAny<T> = unknown extends T
  ? [keyof T] extends [never]
    ? T
    : never
  : T;
```

The trick consists in mapping the tuple in advance before doing the filter, in order to immediately have a tuple with
the right values. That way if the type doesn't really extend U, we always return [never], so you don't have to check
unknown or never.

In this case it is also necessary to pay attention to the distribution, reason why we wrap with a [ ] our type.

That's it, if you haven't got a headache, you're on the right way