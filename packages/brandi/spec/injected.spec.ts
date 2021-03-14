import { injected, token } from '../src';
import { injectsRegistry } from '../src/globals';

describe('injected', () => {
  beforeAll(() => {
    injectsRegistry.clear();
  });

  afterEach(() => {
    injectsRegistry.clear();
  });

  it("adds a single token to 'injectsRegistry'", () => {
    class SomeClass {
      constructor(public some: unknown) {}
    }

    const tokens = {
      some: token<unknown>('some'),
    };

    injected(SomeClass, tokens.some);

    expect(injectsRegistry.get(SomeClass)).toStrictEqual([tokens.some]);
  });

  it("adds multiple tokens to 'injectsRegistry'", () => {
    class SomeClass {
      constructor(public some: unknown, public another: unknown) {}
    }

    const tokens = {
      some: token<unknown>('some'),
      another: token<unknown>('another'),
    };

    injected(SomeClass, tokens.some, tokens.another);

    expect(injectsRegistry.get(SomeClass)).toStrictEqual([
      tokens.some,
      tokens.another,
    ]);
  });

  it('rewrites tokens', () => {
    class SomeClass {
      constructor(public some: unknown) {}
    }

    const tokens = {
      some: token<unknown>('some'),
      another: token<unknown>('another'),
    };

    injected(SomeClass, tokens.some);
    injected(SomeClass, tokens.another);

    expect(injectsRegistry.get(SomeClass)).toStrictEqual([tokens.another]);
  });
});
