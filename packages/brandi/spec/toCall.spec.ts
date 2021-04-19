import { Container, injected, token } from '../src';

import { setEnv } from './utils';

jest.useFakeTimers();

describe('toCall', () => {
  it('creates call results in transient scope', () => {
    interface SomeResult {
      some: true;
    }

    const createSome = (): SomeResult => ({ some: true });

    const tokens = {
      someResult: token<SomeResult>('someResult'),
    };

    const container = new Container();
    container.bind(tokens.someResult).toCall(createSome).inTransientScope();

    const firstResult = container.get(tokens.someResult);
    const secondResult = container.get(tokens.someResult);

    expect(firstResult).toStrictEqual<SomeResult>({ some: true });
    expect(secondResult).toStrictEqual<SomeResult>({ some: true });
    expect(firstResult).not.toBe(secondResult);
  });

  it('creates call results in singleton scope', () => {
    interface SomeResult {
      some: true;
    }

    const createSome = (): SomeResult => ({ some: true });

    const tokens = {
      someResult: token<SomeResult>('some'),
    };

    const container = new Container();
    container.bind(tokens.someResult).toCall(createSome).inSingletonScope();

    const firstResult = container.get(tokens.someResult);
    const secondResult = container.get(tokens.someResult);

    expect(firstResult).toStrictEqual<SomeResult>({ some: true });
    expect(secondResult).toStrictEqual<SomeResult>({ some: true });
    expect(firstResult).toBe(secondResult);
  });

  it('creates call results with injections', () => {
    const someValue = 0;

    interface SomeResult {
      value: number;
      another: AnotherResult;
    }

    interface AnotherResult {
      another: true;
    }

    const createAnother = (): AnotherResult => ({ another: true });
    const createSome = (value: number, another: AnotherResult): SomeResult => ({
      value,
      another,
    });

    const tokens = {
      someValue: token<number>('someValue'),
      someResult: token<SomeResult>('someResult'),
      anotherResult: token<AnotherResult>('anotherResult'),
    };

    injected(createSome, tokens.someValue, tokens.anotherResult);

    const container = new Container();
    container.bind(tokens.someValue).toConstant(someValue);
    container
      .bind(tokens.anotherResult)
      .toCall(createAnother)
      .inSingletonScope();
    container.bind(tokens.someResult).toCall(createSome).inTransientScope();

    const firstSomeResult = container.get(tokens.someResult);
    const secondSomeResult = container.get(tokens.someResult);

    expect(firstSomeResult.value).toBe(someValue);
    expect(secondSomeResult.value).toBe(someValue);

    expect(firstSomeResult.another).toStrictEqual<AnotherResult>({
      another: true,
    });
    expect(secondSomeResult.another).toStrictEqual<AnotherResult>({
      another: true,
    });
    expect(firstSomeResult.another).toBe(secondSomeResult.another);
  });

  it('creates a call result with an injection from the parent container', () => {
    const someValue = 1;

    interface SomeResult {
      value: number;
    }

    const createSome = (value: number): SomeResult => ({ value });

    const tokens = {
      someValue: token<number>('someValue'),
      someResult: token<SomeResult>('someResult'),
    };

    injected(createSome, tokens.someValue);

    const parentContainer = new Container();
    parentContainer.bind(tokens.someValue).toConstant(someValue);

    const childContainer = new Container(parentContainer);
    childContainer
      .bind(tokens.someResult)
      .toCall(createSome)
      .inTransientScope();

    const result = childContainer.get(tokens.someResult);

    expect(result.value).toBe(someValue);
  });

  it('creates a call result with an injection from the container from which the result was got', () => {
    const someValue = 1;
    const anotherValue = 2;

    interface SomeResult {
      value: number;
    }

    const createSome = (value: number): SomeResult => ({ value });

    const tokens = {
      someValue: token<number>('someValue'),
      someResult: token<SomeResult>('someResult'),
    };

    injected(createSome, tokens.someValue);

    const parentContainer = new Container();
    parentContainer.bind(tokens.someValue).toConstant(someValue);
    parentContainer
      .bind(tokens.someResult)
      .toCall(createSome)
      .inTransientScope();

    const childContainer = new Container(parentContainer);
    childContainer.bind(tokens.someValue).toConstant(anotherValue);

    const parentContainerResult = parentContainer.get(tokens.someResult);
    const childContainerResult = childContainer.get(tokens.someResult);

    expect(parentContainerResult.value).toBe(someValue);
    expect(childContainerResult.value).toBe(anotherValue);
  });

  it('creates call results in container scope', () => {
    interface SomeResult {
      some: true;
    }

    const createSome = (): SomeResult => ({ some: true });

    const tokens = {
      someResult: token<SomeResult>('someResult'),
    };

    const parentContainer = new Container();
    parentContainer
      .bind(tokens.someResult)
      .toCall(createSome)
      .inContainerScope();

    const childContainer = new Container(parentContainer);

    const parentContainerFirstResult = parentContainer.get(tokens.someResult);
    const parentContainerSecondResult = parentContainer.get(tokens.someResult);
    const childContainerFirstResult = childContainer.get(tokens.someResult);
    const childContainerSecondResult = childContainer.get(tokens.someResult);

    expect(parentContainerFirstResult).toBe(parentContainerSecondResult);
    expect(childContainerFirstResult).toBe(childContainerSecondResult);

    expect(parentContainerFirstResult).not.toBe(childContainerFirstResult);
  });

  it('creates call results in resolution scope', () => {
    interface FirstResult {
      value: boolean;
    }

    interface SecondResult {
      first: FirstResult;
    }

    interface ThirdResult {
      first: FirstResult;
      second: SecondResult;
    }

    interface FourthResult {
      first: FirstResult;
      second: SecondResult;
      third: ThirdResult;
    }

    const createFirst = (): FirstResult => ({ value: true });
    const createSecond = (first: FirstResult): SecondResult => ({ first });
    const createThird = (
      first: FirstResult,
      second: SecondResult,
    ): ThirdResult => ({ first, second });
    const createFourth = (
      first: FirstResult,
      second: SecondResult,
      third: ThirdResult,
    ): FourthResult => ({ first, second, third });

    const tokens = {
      firstResult: token<FirstResult>('firstResult'),
      secondResult: token<SecondResult>('secondResult'),
      thirdResult: token<ThirdResult>('thirdResult'),
      fourthResult: token<FourthResult>('fourthResult'),
    };

    injected(createSecond, tokens.firstResult);
    injected(createThird, tokens.firstResult, tokens.secondResult);
    injected(
      createFourth,
      tokens.firstResult,
      tokens.secondResult,
      tokens.thirdResult,
    );

    const container = new Container();

    container.bind(tokens.firstResult).toCall(createFirst).inResolutionScope();
    container
      .bind(tokens.secondResult)
      .toCall(createSecond)
      .inResolutionScope();
    container.bind(tokens.thirdResult).toCall(createThird).inTransientScope();
    container.bind(tokens.fourthResult).toCall(createFourth).inTransientScope();

    const result = container.get(tokens.fourthResult);

    expect(result.first).toBe(result.second.first);
    expect(result.first).toBe(result.third.first);
    expect(result.first).toBe(result.third.second.first);
    expect(result.second).toBe(result.third.second);
  });

  it('caches the call result in singleton scope if a falsy value was returned', () => {
    const createNull = jest.fn(() => null);

    const tokens = {
      null: token<null>('null'),
    };

    const container = new Container();
    container.bind(tokens.null).toCall(createNull).inSingletonScope();

    container.get(tokens.null);
    container.get(tokens.null);

    expect(createNull).toHaveBeenCalledTimes(1);
  });

  it('caches the call result in container scope if a falsy value was returned', () => {
    const createNull = jest.fn(() => null);

    const tokens = {
      null: token<null>('null'),
    };

    const container = new Container();
    container.bind(tokens.null).toCall(createNull).inContainerScope();

    container.get(tokens.null);
    container.get(tokens.null);

    expect(createNull).toHaveBeenCalledTimes(1);
  });

  it('caches the call result in resolution scope if a falsy value was returned', () => {
    interface FirstResult {
      n: null;
    }

    interface SecondResult {
      n: null;
      first: FirstResult;
    }

    interface ThirdResult {
      n: null;
      first: FirstResult;
      second: SecondResult;
    }

    const createNull = jest.fn(() => null);
    const createFirst = (n: null): FirstResult => ({ n });
    const createSecond = (n: null, first: FirstResult): SecondResult => ({
      n,
      first,
    });
    const createThird = (
      n: null,
      first: FirstResult,
      second: SecondResult,
    ) => ({
      n,
      first,
      second,
    });

    const tokens = {
      null: token<null>('null'),
      firstResult: token<FirstResult>('firstResult'),
      secondResult: token<SecondResult>('secondResult'),
      thirdResult: token<ThirdResult>('thirdResult'),
    };

    injected(createFirst, tokens.null);
    injected(createSecond, tokens.null, tokens.firstResult);
    injected(createThird, tokens.null, tokens.firstResult, tokens.secondResult);

    const container = new Container();
    container.bind(tokens.null).toCall(createNull).inResolutionScope();
    container.bind(tokens.firstResult).toCall(createFirst).inTransientScope();
    container.bind(tokens.secondResult).toCall(createSecond).inTransientScope();
    container.bind(tokens.thirdResult).toCall(createThird).inTransientScope();

    container.get(tokens.thirdResult);

    expect(createNull).toHaveBeenCalledTimes(1);
  });

  it('throws error when trying to create a call with required arguments when the target function was not injected', () => {
    interface SomeResult {
      dependency: unknown;
    }

    const createSome = (dependency: unknown): SomeResult => ({ dependency });

    const tokens = {
      someResult: token('someResult'),
    };

    const container = new Container();
    container.bind(tokens.someResult).toCall(createSome).inTransientScope();

    expect(() =>
      container.get(tokens.someResult),
    ).toThrowErrorMatchingSnapshot();
  });

  it('logs a warning when a binding scope setting method was not called', () => {
    const spy = jest.spyOn(console, 'warn').mockImplementation(() => null);

    const container = new Container();
    container.bind(token<unknown>('unknown')).toCall(() => null);

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
      .toCall(() => null)
      .inTransientScope();

    jest.runAllTimers();

    expect(spy).toHaveBeenCalledTimes(0);

    spy.mockRestore();
  });

  it("skips the logging in 'production' env", () => {
    const restoreEnv = setEnv('production');
    const spy = jest.spyOn(console, 'warn').mockImplementation(() => null);

    const container = new Container();
    container.bind(token<unknown>('unknown')).toCall(() => null);

    jest.runAllTimers();

    expect(spy).toHaveBeenCalledTimes(0);

    restoreEnv();
    spy.mockRestore();
  });
});
