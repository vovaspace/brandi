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
    const someToken = token<string>('some');
    class SomeClass {
      constructor(public str: string) {}
    }

    injected(SomeClass, someToken);

    expect(injectsRegistry.get(SomeClass)).toStrictEqual([someToken]);
  });

  it("adds multiple tokens to 'injectsRegistry'", () => {
    const tokens = {
      first: token<string>('first'),
      second: token<number>('second'),
    };
    class SomeClass {
      constructor(public str: string, public num: number) {}
    }

    injected(SomeClass, tokens.first, tokens.second);

    expect(injectsRegistry.get(SomeClass)).toStrictEqual([
      tokens.first,
      tokens.second,
    ]);
  });

  it('rewrites tokens', () => {
    const tokens = {
      first: token<string>('first'),
      second: token<string>('second'),
    };
    class SomeClass {
      constructor(public str: string) {}
    }

    injected(SomeClass, tokens.first);
    injected(SomeClass, tokens.second);

    expect(injectsRegistry.get(SomeClass)).toStrictEqual([tokens.second]);
  });
});
