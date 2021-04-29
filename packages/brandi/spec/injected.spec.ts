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
    class Some {
      constructor(public value: number) {}
    }

    const TOKENS = {
      value: token<number>('value'),
    };

    injected(Some, TOKENS.value);

    expect(injectsRegistry.get(Some)).toStrictEqual([TOKENS.value]);
  });

  it('registers multiple tokens', () => {
    class Some {
      constructor(public num: number, public str: string) {}
    }

    const TOKENS = {
      num: token<number>('num'),
      str: token<string>('value'),
    };

    injected(Some, TOKENS.num, TOKENS.str);

    expect(injectsRegistry.get(Some)).toStrictEqual([TOKENS.num, TOKENS.str]);
  });

  it('registers an optional token', () => {
    class Some {
      constructor(public required: number, public optional?: string) {}
    }

    const TOKENS = {
      some: token<number>('some'),
      another: token<string>('another'),
    };

    injected(Some, TOKENS.some, TOKENS.another.optional);

    expect(injectsRegistry.get(Some)).toStrictEqual([
      TOKENS.some,
      TOKENS.another.optional,
    ]);
  });

  it('rewrites tokens', () => {
    class Some {
      constructor(public value: number) {}
    }

    const TOKENS = {
      some: token<number>('some'),
      another: token<number>('another'),
    };

    injected(Some, TOKENS.some);
    injected(Some, TOKENS.another);

    expect(injectsRegistry.get(Some)).toStrictEqual([TOKENS.another]);
  });

  describe('typings', () => {
    it('requires to pass dependencies', () => {
      expect.assertions(0);

      class Some {
        constructor(public value: number) {}
      }

      class Another {
        constructor(public value?: number) {}
      }

      const createSome = (value: number): Some => new Some(value);

      const createAnother = (value?: number): Another => new Another(value);

      // @ts-expect-error: Arguments for the rest parameter 'tokens' were not provided.
      injected(Some);

      // @ts-expect-error: Arguments for the rest parameter 'tokens' were not provided.
      injected(Another);

      // @ts-expect-error: Arguments for the rest parameter 'tokens' were not provided.
      injected(createSome);

      // @ts-expect-error: Arguments for the rest parameter 'tokens' were not provided.
      injected(createAnother);
    });

    it('requires to pass the same type of dependency and token', () => {
      expect.assertions(0);

      class Some {
        constructor(public num: number, public str?: string) {}
      }

      const createSome = (num: number, str?: string): Some =>
        new Some(num, str);

      const TOKENS = {
        num: token<number>('num'),
        str: token<string>('str'),
      };

      // @ts-expect-error: Argument of type 'Token<number>' is not assignable to parameter of type 'OptionalToken<string>'.
      injected(Some, TOKENS.num, TOKENS.num);

      // @ts-expect-error: Argument of type 'OptionalToken<number>' is not assignable to parameter of type 'OptionalToken<string>'.
      injected(Some, TOKENS.num, TOKENS.num.optional);

      // @ts-expect-error: Argument of type 'Token<number>' is not assignable to parameter of type 'OptionalToken<string>'.
      injected(createSome, TOKENS.num, TOKENS.num);

      // @ts-expect-error: Argument of type 'OptionalToken<number>' is not assignable to parameter of type 'OptionalToken<string>'.
      injected(createSome, TOKENS.num, TOKENS.num.optional);
    });

    it('requires to separate required and optional dependencies', () => {
      expect.assertions(0);

      class Some {
        constructor(public required: number, public optional?: string) {}
      }

      const createSome = (required: number, optional?: string): Some =>
        new Some(required, optional);

      const TOKENS = {
        some: token<number>('some'),
        another: token<string>('another'),
      };

      // @ts-expect-error: Argument of type 'Token<string>' is not assignable to parameter of type 'OptionalToken<string>'.
      injected(Some, TOKENS.some, TOKENS.another);

      // @ts-expect-error: Argument of type 'OptionalToken<number>' is not assignable to parameter of type 'RequiredToken<number>'.
      injected(Some, TOKENS.some.optional, TOKENS.another.optional);

      // @ts-expect-error: Argument of type 'Token<string>' is not assignable to parameter of type 'OptionalToken<string>'.
      injected(createSome, TOKENS.some, TOKENS.another);

      // @ts-expect-error: Argument of type 'OptionalToken<number>' is not assignable to parameter of type 'RequiredToken<number>'.
      injected(createSome, TOKENS.some.optional, TOKENS.another.optional);
    });

    it("requires to pass optional token for 'unknown' and 'any' dependencies", () => {
      expect.assertions(0);

      class Some {
        constructor(public any: any, public unknown: unknown) {}
      }

      const createSome = (any: any, unknown: unknown): Some =>
        new Some(any, unknown);

      const TOKENS = {
        any: token<any>('any'),
        unknown: token<unknown>('unknown'),
      };

      // @ts-expect-error: Argument of type 'Token<any>' is not assignable to parameter of type 'OptionalToken<any>'.
      injected(Some, TOKENS.any, TOKENS.unknown);

      // @ts-expect-error: Argument of type 'Token<unknown>' is not assignable to parameter of type 'OptionalToken<unknown>'.
      injected(Some, TOKENS.any.optional, TOKENS.unknown);

      // @ts-expect-error: Argument of type 'Token<any>' is not assignable to parameter of type 'OptionalToken<any>'.
      injected(Some, TOKENS.any, TOKENS.unknown.optional);

      // @ts-expect-error: Argument of type 'Token<any>' is not assignable to parameter of type 'OptionalToken<any>'.
      injected(createSome, TOKENS.any, TOKENS.unknown);

      // @ts-expect-error: Argument of type 'Token<unknown>' is not assignable to parameter of type 'OptionalToken<unknown>'.
      injected(createSome, TOKENS.any.optional, TOKENS.unknown);

      // @ts-expect-error: Argument of type 'Token<any>' is not assignable to parameter of type 'OptionalToken<any>'.
      injected(createSome, TOKENS.any, TOKENS.unknown.optional);

      injected(Some, TOKENS.any.optional, TOKENS.unknown.optional);
      injected(createSome, TOKENS.any.optional, TOKENS.unknown.optional);
    });
  });
});
