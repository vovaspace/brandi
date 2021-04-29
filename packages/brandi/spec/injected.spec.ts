import { injected, token } from '../src';
import { injectsRegistry } from '../src/registries';

describe('injected', () => {
  beforeAll(() => {
    injectsRegistry.clear();
  });

  afterEach(() => {
    injectsRegistry.clear();
  });

  it('registers a single token', () => {
    class SomeClass {
      constructor(public some: number) {}
    }

    const tokens = {
      some: token<number>('some'),
    };

    injected(SomeClass, tokens.some);

    expect(injectsRegistry.get(SomeClass)).toStrictEqual([tokens.some]);
  });

  it('registers multiple tokens', () => {
    class SomeClass {
      constructor(public some: number, public another: string) {}
    }

    const tokens = {
      some: token<number>('some'),
      another: token<string>('another'),
    };

    injected(SomeClass, tokens.some, tokens.another);

    expect(injectsRegistry.get(SomeClass)).toStrictEqual([
      tokens.some,
      tokens.another,
    ]);
  });

  it('registers an optional token', () => {
    class SomeClass {
      constructor(public some: number, public another?: string) {}
    }

    const tokens = {
      some: token<number>('some'),
      another: token<string>('another'),
    };

    injected(SomeClass, tokens.some, tokens.another.optional);

    expect(injectsRegistry.get(SomeClass)).toStrictEqual([
      tokens.some,
      tokens.another.optional,
    ]);
  });

  it('rewrites tokens', () => {
    class SomeClass {
      constructor(public some: number) {}
    }

    const tokens = {
      some: token<number>('some'),
      another: token<number>('another'),
    };

    injected(SomeClass, tokens.some);
    injected(SomeClass, tokens.another);

    expect(injectsRegistry.get(SomeClass)).toStrictEqual([tokens.another]);
  });

  describe('typings', () => {
    it('requires to pass dependencies', () => {
      expect.assertions(0);

      class SomeClass {
        constructor(public some: number) {}
      }

      class AnotherClass {
        constructor(public some?: number) {}
      }

      const createSome = (some: number): SomeClass => new SomeClass(some);

      const createAnother = (some?: number): AnotherClass =>
        new AnotherClass(some);

      // @ts-expect-error: Arguments for the rest parameter 'tokens' were not provided.
      injected(SomeClass);

      // @ts-expect-error: Arguments for the rest parameter 'tokens' were not provided.
      injected(AnotherClass);

      // @ts-expect-error: Arguments for the rest parameter 'tokens' were not provided.
      injected(createSome);

      // @ts-expect-error: Arguments for the rest parameter 'tokens' were not provided.
      injected(createAnother);
    });

    it('requires to pass the same type of dependency and token', () => {
      expect.assertions(0);

      class SomeClass {
        constructor(public num: number, public str?: string) {}
      }

      const createSome = (num: number, str?: string): SomeClass =>
        new SomeClass(num, str);

      const tokens = {
        num: token<number>('num'),
        str: token<string>('str'),
      };

      // @ts-expect-error: Argument of type 'Token<number>' is not assignable to parameter of type 'OptionalToken<string>'.
      injected(SomeClass, tokens.num, tokens.num);

      // @ts-expect-error: Argument of type 'OptionalToken<number>' is not assignable to parameter of type 'OptionalToken<string>'.
      injected(SomeClass, tokens.num, tokens.num.optional);

      // @ts-expect-error: Argument of type 'Token<number>' is not assignable to parameter of type 'OptionalToken<string>'.
      injected(createSome, tokens.num, tokens.num);

      // @ts-expect-error: Argument of type 'OptionalToken<number>' is not assignable to parameter of type 'OptionalToken<string>'.
      injected(createSome, tokens.num, tokens.num.optional);
    });

    it('requires to separate required and optional dependencies', () => {
      expect.assertions(0);

      class SomeClass {
        constructor(public required: number, public optional?: string) {}
      }

      const createSome = (required: number, optional?: string): SomeClass =>
        new SomeClass(required, optional);

      const tokens = {
        some: token<number>('some'),
        another: token<string>('another'),
      };

      // @ts-expect-error: Argument of type 'Token<string>' is not assignable to parameter of type 'OptionalToken<string>'.
      injected(SomeClass, tokens.some, tokens.another);

      // @ts-expect-error: Argument of type 'OptionalToken<number>' is not assignable to parameter of type 'RequiredToken<number>'.
      injected(SomeClass, tokens.some.optional, tokens.another.optional);

      // @ts-expect-error: Argument of type 'Token<string>' is not assignable to parameter of type 'OptionalToken<string>'.
      injected(createSome, tokens.some, tokens.another);

      // @ts-expect-error: Argument of type 'OptionalToken<number>' is not assignable to parameter of type 'RequiredToken<number>'.
      injected(createSome, tokens.some.optional, tokens.another.optional);
    });

    it("requires to pass optional token for 'unknown' and 'any' dependencies", () => {
      expect.assertions(0);

      class SomeClass {
        constructor(public any: any, public unknown: unknown) {}
      }

      const createSome = (any: any, unknown: unknown): SomeClass =>
        new SomeClass(any, unknown);

      const tokens = {
        any: token<any>('any'),
        unknown: token<unknown>('unknown'),
      };

      // @ts-expect-error: Argument of type 'Token<any>' is not assignable to parameter of type 'OptionalToken<any>'.
      injected(SomeClass, tokens.any, tokens.unknown);

      // @ts-expect-error: Argument of type 'Token<unknown>' is not assignable to parameter of type 'OptionalToken<unknown>'.
      injected(SomeClass, tokens.any.optional, tokens.unknown);

      // @ts-expect-error: Argument of type 'Token<any>' is not assignable to parameter of type 'OptionalToken<any>'.
      injected(SomeClass, tokens.any, tokens.unknown.optional);

      // @ts-expect-error: Argument of type 'Token<any>' is not assignable to parameter of type 'OptionalToken<any>'.
      injected(createSome, tokens.any, tokens.unknown);

      // @ts-expect-error: Argument of type 'Token<unknown>' is not assignable to parameter of type 'OptionalToken<unknown>'.
      injected(createSome, tokens.any.optional, tokens.unknown);

      // @ts-expect-error: Argument of type 'Token<any>' is not assignable to parameter of type 'OptionalToken<any>'.
      injected(createSome, tokens.any, tokens.unknown.optional);

      injected(SomeClass, tokens.any.optional, tokens.unknown.optional);
      injected(createSome, tokens.any.optional, tokens.unknown.optional);
    });
  });
});
