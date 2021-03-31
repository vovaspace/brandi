import { Container, token } from '../src';

describe('toConstant', () => {
  it('returns a primitive value', () => {
    const value = 0;

    const tokens = {
      value: token<number>('value'),
    };

    const container = new Container();
    container.bind(tokens.value).toConstant(value);

    expect(container.get(tokens.value)).toBe(value);
  });

  it('returns a constructor', () => {
    class SomeClass {}

    const tokens = {
      ctor: token<typeof SomeClass>('ctor'),
    };

    const container = new Container();
    container.bind(tokens.ctor).toConstant(SomeClass);

    expect(container.get(tokens.ctor)).toBe(SomeClass);
  });
});
