import { Container, injected, token } from '../src';

import { setEnv } from './utils';

jest.useFakeTimers();

describe('toInstance', () => {
  it('creates instances in transient scope', () => {
    class Some {}

    const createSome = (): Some => ({});

    const TOKENS = {
      someInstance: token<Some>('some:instance'),
      someReturn: token<Some>('some:return'),
    };

    const container = new Container();
    container.bind(TOKENS.someInstance).toInstance(Some).inTransientScope();
    container.bind(TOKENS.someReturn).toInstance(createSome).inTransientScope();

    const firstInstance = container.get(TOKENS.someInstance);
    const secondInstance = container.get(TOKENS.someInstance);

    const firstReturn = container.get(TOKENS.someReturn);
    const secondReturn = container.get(TOKENS.someReturn);

    expect(firstInstance).toBeInstanceOf(Some);
    expect(secondInstance).toBeInstanceOf(Some);
    expect(firstInstance).not.toBe(secondInstance);

    expect(firstReturn).toStrictEqual<Some>({});
    expect(secondReturn).toStrictEqual<Some>({});
    expect(firstReturn).not.toBe(secondReturn);
  });

  it('creates instances in singleton scope', () => {
    class Some {}

    const createSome = (): Some => ({});

    const TOKENS = {
      someInstance: token<Some>('some:instance'),
      someReturn: token<Some>('some:return'),
    };

    const container = new Container();
    container.bind(TOKENS.someInstance).toInstance(Some).inSingletonScope();
    container.bind(TOKENS.someReturn).toInstance(createSome).inSingletonScope();

    const firstInstance = container.get(TOKENS.someInstance);
    const secondInstance = container.get(TOKENS.someInstance);

    const firstReturn = container.get(TOKENS.someReturn);
    const secondReturn = container.get(TOKENS.someReturn);

    expect(firstInstance).toBeInstanceOf(Some);
    expect(secondInstance).toBeInstanceOf(Some);
    expect(firstInstance).toBe(secondInstance);

    expect(firstReturn).toStrictEqual<Some>({});
    expect(secondReturn).toStrictEqual<Some>({});
    expect(firstReturn).toBe(secondReturn);
  });

  it("caches the call result in singleton scope if a falsy but not 'undefined' value was returned", () => {
    const createNull = jest.fn(() => null);
    const createFalse = jest.fn(() => false);
    const createZero = jest.fn(() => 0);
    const createUndefined = jest.fn(() => undefined);

    const TOKENS = {
      null: token<null>('null'),
      false: token<boolean>('false'),
      zero: token<number>('zero'),
      undefined: token<undefined>('undefined'),
    };

    const container = new Container();
    container.bind(TOKENS.null).toInstance(createNull).inSingletonScope();
    container.bind(TOKENS.false).toInstance(createFalse).inSingletonScope();
    container.bind(TOKENS.zero).toInstance(createZero).inSingletonScope();
    container
      .bind(TOKENS.undefined)
      .toInstance(createUndefined)
      .inSingletonScope();

    container.get(TOKENS.null);
    container.get(TOKENS.null);
    container.get(TOKENS.false);
    container.get(TOKENS.false);
    container.get(TOKENS.zero);
    container.get(TOKENS.zero);
    container.get(TOKENS.undefined);
    container.get(TOKENS.undefined);

    expect(createNull).toHaveBeenCalledTimes(1);
    expect(createFalse).toHaveBeenCalledTimes(1);
    expect(createZero).toHaveBeenCalledTimes(1);
    expect(createUndefined).toHaveBeenCalledTimes(2);
  });

  it('creates singleton scoped instances unique to its bindings', () => {
    class Some {}

    const TOKENS = {
      some: token<Some>('some'),
    };

    const parentContainer = new Container();
    parentContainer.bind(TOKENS.some).toInstance(Some).inSingletonScope();

    const childContainer = new Container().extend(parentContainer);
    childContainer.bind(TOKENS.some).toInstance(Some).inSingletonScope();

    const parentInstance = parentContainer.get(TOKENS.some);
    const childInstance = childContainer.get(TOKENS.some);

    expect(parentInstance).toBeInstanceOf(Some);
    expect(childInstance).toBeInstanceOf(Some);
    expect(parentInstance).not.toBe(childInstance);
  });

  it('shares a singleton between the original container and its copy', () => {
    class Some {}

    const TOKENS = {
      some: token<Some>('some'),
    };

    const originalContainer = new Container();
    originalContainer.bind(TOKENS.some).toInstance(Some).inSingletonScope();

    const copiedContainer = originalContainer.clone();

    const copiedContainerInstance = copiedContainer.get(TOKENS.some);
    const originalContainerInstance = originalContainer.get(TOKENS.some);

    expect(copiedContainerInstance).toBe(originalContainerInstance);
  });

  it('creates instances with injections', () => {
    const value = 1;

    class First {}

    class Second {}

    class Third {
      constructor(
        public num: number,
        public first: First,
        public second: Second,
      ) {}
    }

    const createThird = (num: number, first: First, second: Second) => ({
      num,
      first,
      second,
    });

    const TOKENS = {
      num: token<number>('some'),
      first: token<First>('first'),
      second: token<Second>('second'),
      thirdInstance: token<Third>('third:instance'),
      thirdReturn: token<Third>('third:return'),
    };

    injected(Third, TOKENS.num, TOKENS.first, TOKENS.second);
    injected(createThird, TOKENS.num, TOKENS.first, TOKENS.second);

    const container = new Container();
    container.bind(TOKENS.num).toConstant(value);
    container.bind(TOKENS.first).toInstance(First).inTransientScope();
    container.bind(TOKENS.second).toInstance(Second).inSingletonScope();
    container.bind(TOKENS.thirdInstance).toInstance(Third).inTransientScope();
    container
      .bind(TOKENS.thirdReturn)
      .toInstance(createThird)
      .inTransientScope();

    const firstInstance = container.get(TOKENS.thirdInstance);
    const secondInstance = container.get(TOKENS.thirdInstance);
    const firstReturn = container.get(TOKENS.thirdReturn);
    const secondReturn = container.get(TOKENS.thirdReturn);

    expect(firstInstance.num).toBe(value);
    expect(secondInstance.num).toBe(value);
    expect(firstReturn.num).toBe(value);
    expect(secondReturn.num).toBe(value);

    expect(firstInstance.first).toBeInstanceOf(First);
    expect(secondInstance.first).toBeInstanceOf(First);
    expect(firstReturn.first).toBeInstanceOf(First);
    expect(secondReturn.first).toBeInstanceOf(First);
    expect(firstInstance.first).not.toBe(secondInstance.first);
    expect(firstReturn.first).not.toBe(secondReturn.first);

    expect(firstInstance.second).toBeInstanceOf(Second);
    expect(secondInstance.second).toBeInstanceOf(Second);
    expect(firstReturn.second).toBeInstanceOf(Second);
    expect(secondReturn.second).toBeInstanceOf(Second);
    expect(firstInstance.second).toBe(secondInstance.second);
    expect(firstReturn.second).toBe(secondInstance.second);
  });

  it('creates an instance with an injection from the parent container', () => {
    const value = 1;

    class Some {
      constructor(public num: number) {}
    }

    const TOKENS = {
      value: token<number>('value'),
      some: token<Some>('some'),
    };

    injected(Some, TOKENS.value);

    const parentContainer = new Container();
    parentContainer.bind(TOKENS.value).toConstant(value);

    const childContainer = new Container().extend(parentContainer);
    childContainer.bind(TOKENS.some).toInstance(Some).inTransientScope();

    const instance = childContainer.get(TOKENS.some);

    expect(instance.num).toBe(value);
  });

  it('creates an instance with an injection from the container from which the instance was got', () => {
    const someValue = 1;
    const anotherValue = 2;

    class Some {
      constructor(public num: number) {}
    }

    const TOKENS = {
      num: token<number>('num'),
      some: token<Some>('some'),
    };

    injected(Some, TOKENS.num);

    const parentContainer = new Container();
    parentContainer.bind(TOKENS.num).toConstant(someValue);
    parentContainer.bind(TOKENS.some).toInstance(Some).inTransientScope();

    const childContainer = new Container().extend(parentContainer);
    childContainer.bind(TOKENS.num).toConstant(anotherValue);

    const parentContainerInstance = parentContainer.get(TOKENS.some);
    const childContainerInstance = childContainer.get(TOKENS.some);

    expect(parentContainerInstance.num).toBe(someValue);
    expect(childContainerInstance.num).toBe(anotherValue);
  });

  it('creates instances in container scope', () => {
    class Some {}

    const TOKENS = {
      some: token<Some>('some'),
    };

    const parentContainer = new Container();
    parentContainer.bind(TOKENS.some).toInstance(Some).inContainerScope();

    const childContainer = new Container().extend(parentContainer);

    const parentContainerFirstInstance = parentContainer.get(TOKENS.some);
    const parentContainerSecondInstance = parentContainer.get(TOKENS.some);
    const childContainerFirstInstance = childContainer.get(TOKENS.some);
    const childContainerSecondInstance = childContainer.get(TOKENS.some);

    expect(parentContainerFirstInstance).toBe(parentContainerSecondInstance);
    expect(childContainerFirstInstance).toBe(childContainerSecondInstance);

    expect(parentContainerFirstInstance).not.toBe(childContainerFirstInstance);
  });

  it("caches the call result in container scope if a falsy but not 'undefined' value was returned", () => {
    const createNull = jest.fn(() => null);
    const createFalse = jest.fn(() => false);
    const createZero = jest.fn(() => 0);
    const createUndefined = jest.fn(() => undefined);

    const TOKENS = {
      null: token<null>('null'),
      false: token<boolean>('false'),
      zero: token<number>('zero'),
      undefined: token<undefined>('undefined'),
    };

    const container = new Container();
    container.bind(TOKENS.null).toInstance(createNull).inContainerScope();
    container.bind(TOKENS.false).toInstance(createFalse).inContainerScope();
    container.bind(TOKENS.zero).toInstance(createZero).inContainerScope();
    container
      .bind(TOKENS.undefined)
      .toInstance(createUndefined)
      .inContainerScope();

    container.get(TOKENS.null);
    container.get(TOKENS.null);
    container.get(TOKENS.false);
    container.get(TOKENS.false);
    container.get(TOKENS.zero);
    container.get(TOKENS.zero);
    container.get(TOKENS.undefined);
    container.get(TOKENS.undefined);

    expect(createNull).toHaveBeenCalledTimes(1);
    expect(createFalse).toHaveBeenCalledTimes(1);
    expect(createZero).toHaveBeenCalledTimes(1);
    expect(createUndefined).toHaveBeenCalledTimes(2);
  });

  it('creates instances in resolution scope', () => {
    class First {}

    class Second {
      constructor(public first: First) {}
    }

    class Third {
      constructor(public first: First, public second: Second) {}
    }

    class Fourth {
      constructor(
        public first: First,
        public second: Second,
        public third: Third,
      ) {}
    }

    const TOKENS = {
      first: token<First>('first'),
      second: token<Second>('second'),
      third: token<Third>('third'),
      fourth: token<Fourth>('fourth'),
    };

    injected(Second, TOKENS.first);
    injected(Third, TOKENS.first, TOKENS.second);
    injected(Fourth, TOKENS.first, TOKENS.second, TOKENS.third);

    const container = new Container();
    container.bind(TOKENS.first).toInstance(First).inResolutionScope();
    container.bind(TOKENS.second).toInstance(Second).inResolutionScope();
    container.bind(TOKENS.third).toInstance(Third).inTransientScope();
    container.bind(TOKENS.fourth).toInstance(Fourth).inTransientScope();

    const instance = container.get(TOKENS.fourth);

    expect(instance.first).toBe(instance.second.first);
    expect(instance.first).toBe(instance.third.first);
    expect(instance.first).toBe(instance.third.second.first);
    expect(instance.second).toBe(instance.third.second);
  });

  it('caches the call result in resolution scope if a falsy value was returned', () => {
    interface First {
      n: null;
      f: boolean;
      z: number;
    }

    interface Second {
      n: null;
      f: boolean;
      z: number;
      first: First;
    }

    interface Third {
      n: null;
      f: boolean;
      z: number;
      first: First;
      second: Second;
    }

    const createNull = jest.fn(() => null);
    const createFalse = jest.fn(() => false);
    const createZero = jest.fn(() => 0);

    const createFirst = (n: null, f: boolean, z: number): First => ({
      n,
      f,
      z,
    });

    const createSecond = (
      n: null,
      f: boolean,
      z: number,
      first: First,
    ): Second => ({
      n,
      f,
      z,
      first,
    });

    const createThird = (
      n: null,
      f: boolean,
      z: number,
      first: First,
      second: Second,
    ) => ({
      n,
      f,
      z,
      first,
      second,
    });

    const TOKENS = {
      null: token<null>('null'),
      false: token<boolean>('false'),
      zero: token<number>('zero'),
      first: token<First>('first'),
      second: token<Second>('second'),
      third: token<Third>('third'),
    };

    injected(createFirst, TOKENS.null, TOKENS.false, TOKENS.zero);
    injected(
      createSecond,
      TOKENS.null,
      TOKENS.false,
      TOKENS.zero,
      TOKENS.first,
    );
    injected(
      createThird,
      TOKENS.null,
      TOKENS.false,
      TOKENS.zero,
      TOKENS.first,
      TOKENS.second,
    );

    const container = new Container();

    container.bind(TOKENS.null).toInstance(createNull).inResolutionScope();
    container.bind(TOKENS.false).toInstance(createFalse).inResolutionScope();
    container.bind(TOKENS.zero).toInstance(createZero).inResolutionScope();

    container.bind(TOKENS.first).toInstance(createFirst).inTransientScope();
    container.bind(TOKENS.second).toInstance(createSecond).inTransientScope();
    container.bind(TOKENS.third).toInstance(createThird).inTransientScope();

    container.get(TOKENS.third);

    expect(createNull).toHaveBeenCalledTimes(1);
    expect(createFalse).toHaveBeenCalledTimes(1);
    expect(createZero).toHaveBeenCalledTimes(1);
  });

  it('throws error when trying to construct an instance with required constructor arguments when the creator was not injected', () => {
    class Some {
      constructor(public dependency: unknown) {}
    }

    const createSome = (dependency: unknown): Some => ({ dependency });

    const TOKENS = {
      someInstance: token('some:instance'),
      someReturn: token('some:return'),
    };

    const container = new Container();
    container.bind(TOKENS.someInstance).toInstance(Some).inTransientScope();
    container.bind(TOKENS.someReturn).toInstance(createSome).inTransientScope();

    expect(() =>
      container.get(TOKENS.someInstance),
    ).toThrowErrorMatchingSnapshot();
    expect(() =>
      container.get(TOKENS.someReturn),
    ).toThrowErrorMatchingSnapshot();
  });

  it('logs a warning when a binding scope setting method was not called', () => {
    const spy = jest.spyOn(console, 'warn').mockImplementation(() => null);

    const container = new Container();
    container.bind(token<unknown>('unknown')).toInstance(class {});

    jest.runAllTimers();

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0]?.[0]).toMatchSnapshot();

    spy.mockRestore();
  });

  it('does not log a warning when a binding scope setting method was called', () => {
    const spy = jest.spyOn(console, 'warn').mockImplementation(() => null);

    const container = new Container();
    container
      .bind(token<unknown>('unknown'))
      .toInstance(class {})
      .inTransientScope();

    jest.runAllTimers();

    expect(spy).toHaveBeenCalledTimes(0);

    spy.mockRestore();
  });

  it("skips the logging in 'production' env", () => {
    const restoreEnv = setEnv('production');
    const spy = jest.spyOn(console, 'warn').mockImplementation(() => null);

    const container = new Container();
    container.bind(token<unknown>('unknown')).toInstance(class {});

    jest.runAllTimers();

    expect(spy).toHaveBeenCalledTimes(0);

    restoreEnv();
    spy.mockRestore();
  });

  describe('typings', () => {
    it('requires to bind the same type of dependency and token', () => {
      expect.assertions(0);

      class Some {
        public some = true;
      }

      class Another {
        public another = true;
      }

      const createAnother = (): Another => new Another();

      const TOKENS = {
        some: token<Some>('some'),
      };

      const container = new Container();

      // @ts-expect-error: Argument of type 'typeof Another' is not assignable to parameter of type 'UnknownCreator<Some>'.
      container.bind(TOKENS.some).toInstance(Another).inTransientScope();

      // @ts-expect-error: Argument of type '() => Another' is not assignable to parameter of type 'UnknownCreator<Some>'.
      container.bind(TOKENS.some).toInstance(createAnother).inTransientScope();
    });
  });
});
