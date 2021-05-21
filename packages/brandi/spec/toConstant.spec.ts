import { Container, token } from '../src';

describe('toConstant', () => {
  it('returns a primitive value', () => {
    const value = 0;

    const TOKENS = {
      value: token<number>('value'),
    };

    const container = new Container();
    container.bind(TOKENS.value).toConstant(value);

    expect(container.get(TOKENS.value)).toBe(value);
  });

  it('returns a constructor', () => {
    class Some {}

    const TOKENS = {
      SomeCtor: token<typeof Some>('SomeCtor'),
    };

    const container = new Container();
    container.bind(TOKENS.SomeCtor).toConstant(Some);

    expect(container.get(TOKENS.SomeCtor)).toBe(Some);
  });

  describe('typings', () => {
    it('requires to bind the same type of dependency and token', () => {
      expect.assertions(0);

      const TOKENS = {
        num: token<number>('num'),
      };

      const container = new Container();

      // @ts-expect-error: Argument of type 'string' is not assignable to parameter of type 'number'.
      container.bind(TOKENS.num).toConstant('');
    });
  });
});
