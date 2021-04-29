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
});
