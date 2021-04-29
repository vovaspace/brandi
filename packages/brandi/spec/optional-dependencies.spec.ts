import { Container, injected, token } from '../src';

describe('optional dependencies', () => {
  it('gets an optional dependency from the container', () => {
    const value = 1;

    const TOKENS = {
      some: token<number>('some'),
      another: token<number>('another'),
    };

    const container = new Container();

    container.bind(TOKENS.some).toConstant(value);

    expect(container.get(TOKENS.some.optional)).toBe(value);
    expect(container.get(TOKENS.another.optional)).toBeUndefined();
  });

  it('injects an optional dependency', () => {
    const someValue = 1;

    class Some {
      constructor(public value?: number) {}
    }

    const TOKENS = {
      value: token<number>('value'),
      some: token<Some>('some'),
    };

    injected(Some, TOKENS.value.optional);

    const container = new Container();

    container.bind(TOKENS.some).toInstance(Some).inTransientScope();

    const firstInstance = container.get(TOKENS.some);

    container.bind(TOKENS.value).toConstant(someValue);

    const secondInstance = container.get(TOKENS.some);

    expect(firstInstance.value).toBeUndefined();
    expect(secondInstance.value).toBe(someValue);
  });

  it("allows to skip 'injected' registration of entities where all dependencies have a default value", () => {
    const defaultNum = 1;
    const defaultStr = 'A';

    class Some {
      constructor(
        public num: number = defaultNum,
        public str: string = defaultStr,
      ) {}
    }

    const TOKENS = {
      some: token<Some>('some'),
    };

    const container = new Container();
    container.bind(TOKENS.some).toInstance(Some).inTransientScope();

    const instance = container.get(TOKENS.some);

    expect(instance.num).toBe(defaultNum);
    expect(instance.str).toBe(defaultStr);
  });

  it('ignores a default value of an optional dependency if the dependency was got from the container', () => {
    const defaultValue = 1;
    const someValue = 2;

    class Some {
      constructor(public value: number = defaultValue) {}
    }

    const TOKENS = {
      value: token<number>('value'),
      some: token<Some>('some'),
    };

    injected(Some, TOKENS.value.optional);

    const container = new Container();
    container.bind(TOKENS.some).toInstance(Some).inTransientScope();
    container.bind(TOKENS.value).toConstant(someValue);

    const instance = container.get(TOKENS.some);

    expect(instance.value).toBe(someValue);
  });

  it('uses the default value if the optional dependency was not injected', () => {
    const defaultValue = 1;

    class Some {
      constructor(public value: number = defaultValue) {}
    }

    const TOKENS = {
      value: token<number>('value'),
      some: token<Some>('some'),
    };

    injected(Some, TOKENS.value.optional);

    const container = new Container();
    container.bind(TOKENS.some).toInstance(Some).inTransientScope();

    const instance = container.get(TOKENS.some);

    expect(instance.value).toBe(defaultValue);
  });
});
