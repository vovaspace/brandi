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

  it("allows to skip 'injected' registration of entities where all dependencies have a default value", () => {
    const defaultNum = 1;
    const defaultStr = 'A';

    class SomeClass {
      constructor(
        public num: number = defaultNum,
        public str: string = defaultStr,
      ) {}
    }

    const tokens = {
      someClass: token<SomeClass>('someClass'),
    };

    const container = new Container();
    container.bind(tokens.someClass).toInstance(SomeClass).inTransientScope();

    const instance = container.get(tokens.someClass);

    expect(instance.num).toBe(defaultNum);
    expect(instance.str).toBe(defaultStr);
  });

  it('ignores a default value of an optional dependency if the dependency was got from the container', () => {
    const defaultValue = 1;
    const value = 2;

    class SomeClass {
      constructor(public some: number = defaultValue) {}
    }

    const tokens = {
      value: token<number>('value'),
      someClass: token<SomeClass>('someClass'),
    };

    injected(SomeClass, tokens.value.optional);

    const container = new Container();
    container.bind(tokens.someClass).toInstance(SomeClass).inTransientScope();
    container.bind(tokens.value).toConstant(value);

    const instance = container.get(tokens.someClass);

    expect(instance.some).toBe(value);
  });

  it('uses the default value if the optional dependency was not injected', () => {
    const defaultValue = 1;

    class SomeClass {
      constructor(public some: number = defaultValue) {}
    }

    const tokens = {
      value: token<number>('value'),
      someClass: token<SomeClass>('someClass'),
    };

    injected(SomeClass, tokens.value.optional);

    const container = new Container();
    container.bind(tokens.someClass).toInstance(SomeClass).inTransientScope();

    const instance = container.get(tokens.someClass);

    expect(instance.some).toBe(defaultValue);
  });
});
