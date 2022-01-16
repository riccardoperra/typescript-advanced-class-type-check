import { Expect, expecter } from "ts-snippet";

export const compilerOptions = () => ({
  moduleResolution: "node",
  target: "es2015",
  module: "esnext",
  baseUrl: ".",
  experimentalDecorators: true
});

describe("type inference ", () => {
  const snippetFactory = (code: string): string => `
    import { Ref } from './src/ref';
    ${code}
  `;

  function testWith(expectSnippet: (code: string) => Expect): void {
    it("when pass class with single Ref<> parameter", () => {
      expectSnippet(`
        class Test {
          constructor(
            private readonly p1: string,
            private readonly p2: Ref<string>,
            private readonly p3: number
          ) {}
        }

        const result = fn(Test);
    `).toInfer("result", "string");
    });

    it("when pass class with multiple Ref<> parameter", () => {
      expectSnippet(`
        class Test {
          constructor(
            private readonly p1: Ref<string>,
            private readonly p2: Ref<number>,
            private readonly p3: number,
            private readonly p4: Ref<Ref<string>>,
            private readonly p5: number
          ) {}
        }

        const result = fn(Test);
    `).toInfer("result", "string | number | Ref<string>");
    });

    it("when pass class with no Ref<> parameter", () => {
      expectSnippet(`
        class Test {
          constructor(
            private readonly p1: string, 
            private readonly p2: number
          ) {}
        }

        const result = fn(Test);
    `).toFail(
        /Argument of type 'typeof Test' is not assignable to parameter of type 'never'/
      );
    });

    it("when pass class with Ref<> like interface (opaque type test)", () => {
      expectSnippet(`
        class Test {
          constructor(
            private readonly p1: {}, 
            private readonly p2: {test: string},
            private readonly p3: {ref: Ref<string>}
          ) {}

        } 
        
        const result = fn(Test);
    `).toFail(
        /Argument of type 'typeof Test' is not assignable to parameter of type 'never'/
      );
    });

    it("when pass class with unknown parameter", () => {
      expectSnippet(`
        class Test {
          constructor(
            private readonly p1: unknown,
            private readonly p2: Ref<string>,
          ) {}
        }

        const result = fn(Test);
    `).toInfer("result", "string");
    });

    it("when pass class with any parameter", () => {
      expectSnippet(`
        class Test {
          constructor(
            private readonly p1: any,
            private readonly p2: Ref<string>,
          ) {}
        }

        const result = fn(Test);
    `).toInfer("result", "string");
    });
  }

  describe("foo - v1", () => {
    const expectSnippet = expecter(
      (code) => `
        import {foo as fn} from './src/ref'; 
        ${snippetFactory(code)}
      `,
      {
        ...compilerOptions(),
        strict: true
      }
    );
    testWith(expectSnippet);
  });

  describe("fooTsToolbelt - v2", () => {
    const expectSnippet = expecter(
      (code) => `
        import {fooTsToolbelt as fn} from './src/ref-v2'; 
        ${snippetFactory(code)}
      `,
      {
        ...compilerOptions(),
        strict: true
      }
    );
    testWith(expectSnippet);
  });
});
