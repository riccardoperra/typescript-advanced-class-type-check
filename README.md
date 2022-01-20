# ts-advanced-constructor-type-check

Created with CodeSandbox

### Motivation

Sometimes it can be useful to constraint a function parameter type to a class that has in its constructor a specific,
defined type.

### Explanation

Let's start! Our goal is to create a stricter type than `Constructor<T>`, because we want that the given class <strong>must contains</strong>
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

First, we need to define a utility type that a defines a class constructor. Our function will take a class as
parameter and return an output type.

```ts
type Constructor<T> = new (...args: any[]) => T;
type Output<T extends Constructor<T>> = InstanceType<T>;

declare function foo<T extends Constructor<unknown>>(
  classConstructor: T
): Output<T>;

class Foo {
  constructor(p1: string, p2: number, p3: {}) {}
}

const result = foo(Foo);
// Result is instance of Foo
```

First, we need to get the constructor parameters of the class. This could be done using the Typescript built-in utility
function `ConstructorParameters`, extremely useful because it returns
a [tuple type](https://www.typescriptlang.org/docs/handbook/2/objects.html#tuple-types).

```ts
class Foo {
  constructor(p1: string, p2: number, p3: symbol) {}
}

// [p1: string, p2: number, p3: symbol]
type Parameters = ConstructorParameters<typeof Foo>;
```

The next step is to take the tuple that we got before and create a new tuple that only contains the properties with the
Example interface.

Before TS 4.1, you could do it probably using overloading (have you ever seen [reselect](https://github.com/reduxjs/reselect/blob/master/src/typesVersions/ts4.1/index.d.ts)?),
but with the newest implementation of [variadic tuple types](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-0.html),
recursive types support and type conditionals with conditionals we can handle it with a custom type 😇.

```ts
export type TupleSelect<
  T extends readonly unknown[],
  Match
> = // Our array extends a tuple, it obviously passes. We need only to use the infer keyword to take the head and the tail,
T extends [infer Head, ...infer Tail]
  ? // If our Head is the same as Match
    [Head] extends [Match]
    ? // Creates a new tuple with the head, and recursively do the selection
      // with the rest of the array: our tail
      [Head, ...TupleSelect<Tail, Match>]
    : // Otherwise returns the tail, because our head is not the type we are looking for
      TupleSelect<Tail, Match>
  : [];
```

This could be a simple ts re-implementation.

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

That's it! Now we can filter out the properties that don't match our type.

```ts
interface Example<T> {}

class Foo {
  constructor(p1: string, p2: number, p3: symbol, p4: string) {}
}

// [p1: string, p2: number, p3: symbol, string]
type Parameters = ConstructorParameters<typeof Foo>;
// [p1: string, p4: string]
type OnlyStringParameters = TupleSelect<Parameters, string>;
```

At the last step, we have to create the type that apply the constraint to our class constructor: if the `TupleSelect` result
is an empty array, we can return `never`, otherwise we can return the right constructor type.

```ts
class Foo {
  constructor(p1: string, p2: number) {}
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
class Example<T> {}

type AllowedParameters<T> = TupleSelect<
  ConstructorParameters<T>,
  Example<unknown>
>;

type StrictConstructor<T> = AllowedParameters<T>["length"] extends 0
  ? never
  : T;

declare function foo<T extends Constructor<unknown>>(
  classConstructor: StrictConstructor<T>
): InstanceType<T>;

class Foo {
  constructor(p1: string, p2: number, p3: Example<string>) {}
}

class FooBad {
  constructor(p1: string, p2: number) {}
}

// Foo class instance
const result = foo(Foo);
// Argument of type `typeof FooBad` is not assignable to parameter of type never.
const result2 = foo(FooBad);
```
