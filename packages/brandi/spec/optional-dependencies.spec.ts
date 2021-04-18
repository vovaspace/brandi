import { Container, injected, token } from '../src';

describe('optional dependencies', () => {
  it('gets an optional dependency from the container', () => {
    const someValue = 1;

    const tokens = {
      some: token<number>('some'),
      another: token<number>('another'),
    };

    const container = new Container();

    container.bind(tokens.some).toConstant(someValue);

    expect(container.get(tokens.some)).toBe(someValue);
    expect(container.get(tokens.another.optional)).toBeUndefined();
  });

  it('injects an optional dependency', () => {
    const value = 1;

    class SomeClass {
      constructor(public some?: number) {}
    }

    const tokens = {
      value: token<number>('value'),
      someClass: token<SomeClass>('someClass'),
    };

    injected(SomeClass, tokens.value.optional);

    const container = new Container();

    container.bind(tokens.someClass).toInstance(SomeClass).inTransientScope();

    const firstInstance = container.get(tokens.someClass);

    container.bind(tokens.value).toConstant(value);

    const secondInstance = container.get(tokens.someClass);

    expect(firstInstance.some).toBeUndefined();
    expect(secondInstance.some).toBe(value);
  });
});
