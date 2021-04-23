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

  it('creates singleton scoped call results unique to its bindings', () => {
    interface SomeResult {
      some: true;
    }

    const createSome = (): SomeResult => ({ some: true });

    const tokens = {
      someResult: token<SomeResult>('some'),
    };

    const parentContainer = new Container();
    const childContainer = new Container(parentContainer);

    parentContainer
      .bind(tokens.someResult)
      .toCall(createSome)
      .inSingletonScope();

    childContainer
      .bind(tokens.someResult)
      .toCall(createSome)
      .inSingletonScope();

    const parentResult = parentContainer.get(tokens.someResult);
    const childResult = childContainer.get(tokens.someResult);

    expect(parentResult).toStrictEqual<SomeResult>({ some: true });
    expect(childResult).toStrictEqual<SomeResult>({ some: true });
    expect(parentResult).not.toBe(childResult);
  });

  it('shares a singleton between the original container and its copy', () => {
    interface SomeResult {
      some: true;
    }

    const createSome = (): SomeResult => ({ some: true });

    const tokens = {
      someResult: token<SomeResult>('some'),
    };

    const originalContainer = new Container();

    originalContainer
      .bind(tokens.someResult)
      .toCall(createSome)
      .inSingletonScope();

    const copiedContainer = originalContainer.clone();

    const copiedContainerResult = copiedContainer.get(tokens.someResult);
    const originalContainerResult = originalContainer.get(tokens.someResult);

    expect(copiedContainerResult).toBe(originalContainerResult);
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

  it('creates call results in global scope', () => {
    interface Result {
      some: boolean;
    }

    const createSome = (): Result => ({ some: true });
    const createAnother = (): Result => ({ some: false });

    const tokens = {
      firstResult: token<Result>('firstResult'),
      secondResult: token<Result>('secondResult'),
      thirdResult: token<Result>('thirdResult'),
    };

    const parentContainer = new Container();
    const childContainer = new Container(parentContainer);
    const independentContainer = new Container();

    parentContainer.bind(tokens.firstResult).toCall(createSome).inGlobalScope();
    parentContainer
      .bind(tokens.secondResult)
      .toCall(createSome)
      .inGlobalScope();
    parentContainer.bind(tokens.thirdResult).toCall(createSome).inGlobalScope();

    childContainer.bind(tokens.firstResult).toCall(createSome).inGlobalScope();
    childContainer.bind(tokens.secondResult).toCall(createSome).inGlobalScope();
    childContainer
      .bind(tokens.thirdResult)
      .toCall(createAnother)
      .inGlobalScope();

    independentContainer
      .bind(tokens.firstResult)
      .toCall(createSome)
      .inGlobalScope();
    independentContainer
      .bind(tokens.secondResult)
      .toCall(createSome)
      .inGlobalScope();
    independentContainer
      .bind(tokens.thirdResult)
      .toCall(createAnother)
      .inGlobalScope();

    const parentFirstResult = parentContainer.get(tokens.firstResult);
    const parentSecondResult = parentContainer.get(tokens.secondResult);
    const parentThirdResult = parentContainer.get(tokens.thirdResult);
    const childFirstResult = childContainer.get(tokens.firstResult);
    const childSecondResult = childContainer.get(tokens.secondResult);
    const childThirdResult = childContainer.get(tokens.thirdResult);
    const independentFirstResult = independentContainer.get(tokens.firstResult);
    const independentSecondResult = independentContainer.get(
      tokens.secondResult,
    );
    const independentThirdResult = independentContainer.get(tokens.thirdResult);

    expect(parentFirstResult).toStrictEqual<Result>({ some: true });
    expect(childFirstResult).toStrictEqual<Result>({ some: true });
    expect(independentFirstResult).toStrictEqual<Result>({ some: true });

    expect(parentSecondResult).toStrictEqual<Result>({ some: true });
    expect(childSecondResult).toStrictEqual<Result>({ some: true });
    expect(independentSecondResult).toStrictEqual<Result>({ some: true });

    expect(parentThirdResult).toStrictEqual<Result>({ some: true });
    expect(childThirdResult).toStrictEqual<Result>({ some: false });
    expect(independentThirdResult).toStrictEqual<Result>({ some: false });

    expect(parentFirstResult).toBe(childFirstResult);
    expect(childFirstResult).toBe(independentFirstResult);

    expect(parentSecondResult).toBe(childSecondResult);
    expect(childSecondResult).toBe(independentSecondResult);

    expect(parentSecondResult).not.toBe(parentFirstResult);

    expect(childThirdResult).toBe(independentThirdResult);
    expect(childThirdResult).not.toBe(parentThirdResult);

    expect(parentThirdResult).not.toBe(parentFirstResult);
    expect(parentThirdResult).not.toBe(parentSecondResult);
  });

  it("caches the call result in singleton scope if a falsy but not 'undefined' value was returned", () => {
    const createNull = jest.fn(() => null);
    const createFalse = jest.fn(() => false);
    const createZero = jest.fn(() => 0);
    const createUndefined = jest.fn(() => undefined);

    const tokens = {
      null: token<null>('null'),
      false: token<boolean>('false'),
      zero: token<number>('zero'),
      undefined: token<undefined>('undefined'),
    };

    const container = new Container();
    container.bind(tokens.null).toCall(createNull).inSingletonScope();
    container.bind(tokens.false).toCall(createFalse).inSingletonScope();
    container.bind(tokens.zero).toCall(createZero).inSingletonScope();
    container.bind(tokens.undefined).toCall(createUndefined).inSingletonScope();

    container.get(tokens.null);
    container.get(tokens.null);
    container.get(tokens.false);
    container.get(tokens.false);
    container.get(tokens.zero);
    container.get(tokens.zero);
    container.get(tokens.undefined);
    container.get(tokens.undefined);

    expect(createNull).toHaveBeenCalledTimes(1);
    expect(createFalse).toHaveBeenCalledTimes(1);
    expect(createZero).toHaveBeenCalledTimes(1);
    expect(createUndefined).toHaveBeenCalledTimes(2);
  });

  it("caches the call result in container scope if a falsy but not 'undefined' value was returned", () => {
    const createNull = jest.fn(() => null);
    const createFalse = jest.fn(() => false);
    const createZero = jest.fn(() => 0);
    const createUndefined = jest.fn(() => undefined);

    const tokens = {
      null: token<null>('null'),
      false: token<boolean>('false'),
      zero: token<number>('zero'),
      undefined: token<undefined>('undefined'),
    };

    const container = new Container();
    container.bind(tokens.null).toCall(createNull).inContainerScope();
    container.bind(tokens.false).toCall(createFalse).inContainerScope();
    container.bind(tokens.zero).toCall(createZero).inContainerScope();
    container.bind(tokens.undefined).toCall(createUndefined).inContainerScope();

    container.get(tokens.null);
    container.get(tokens.null);
    container.get(tokens.false);
    container.get(tokens.false);
    container.get(tokens.zero);
    container.get(tokens.zero);
    container.get(tokens.undefined);
    container.get(tokens.undefined);

    expect(createNull).toHaveBeenCalledTimes(1);
    expect(createFalse).toHaveBeenCalledTimes(1);
    expect(createZero).toHaveBeenCalledTimes(1);
    expect(createUndefined).toHaveBeenCalledTimes(2);
  });

  it('caches the call result in resolution scope if a falsy value was returned', () => {
    interface FirstResult {
      n: null;
      f: boolean;
      z: number;
    }

    interface SecondResult {
      n: null;
      f: boolean;
      z: number;
      first: FirstResult;
    }

    interface ThirdResult {
      n: null;
      f: boolean;
      z: number;
      first: FirstResult;
      second: SecondResult;
    }

    const createNull = jest.fn(() => null);
    const createFalse = jest.fn(() => false);
    const createZero = jest.fn(() => 0);

    const createFirst = (n: null, f: boolean, z: number): FirstResult => ({
      n,
      f,
      z,
    });

    const createSecond = (
      n: null,
      f: boolean,
      z: number,
      first: FirstResult,
    ): SecondResult => ({
      n,
      f,
      z,
      first,
    });

    const createThird = (
      n: null,
      f: boolean,
      z: number,
      first: FirstResult,
      second: SecondResult,
    ) => ({
      n,
      f,
      z,
      first,
      second,
    });

    const tokens = {
      null: token<null>('null'),
      false: token<boolean>('false'),
      zero: token<number>('zero'),
      firstResult: token<FirstResult>('firstResult'),
      secondResult: token<SecondResult>('secondResult'),
      thirdResult: token<ThirdResult>('thirdResult'),
    };

    injected(createFirst, tokens.null, tokens.false, tokens.zero);
    injected(
      createSecond,
      tokens.null,
      tokens.false,
      tokens.zero,
      tokens.firstResult,
    );
    injected(
      createThird,
      tokens.null,
      tokens.false,
      tokens.zero,
      tokens.firstResult,
      tokens.secondResult,
    );

    const container = new Container();

    container.bind(tokens.null).toCall(createNull).inResolutionScope();
    container.bind(tokens.false).toCall(createFalse).inResolutionScope();
    container.bind(tokens.zero).toCall(createZero).inResolutionScope();

    container.bind(tokens.firstResult).toCall(createFirst).inTransientScope();
    container.bind(tokens.secondResult).toCall(createSecond).inTransientScope();
    container.bind(tokens.thirdResult).toCall(createThird).inTransientScope();

    container.get(tokens.thirdResult);

    expect(createNull).toHaveBeenCalledTimes(1);
    expect(createFalse).toHaveBeenCalledTimes(1);
    expect(createZero).toHaveBeenCalledTimes(1);
  });

  it("caches the call result in global scope if a falsy but not 'undefined' value was returned", () => {
    const createNull = jest.fn(() => null);
    const createFalse = jest.fn(() => false);
    const createZero = jest.fn(() => 0);
    const createUndefined = jest.fn(() => undefined);

    const tokens = {
      null: token<null>('null'),
      false: token<boolean>('false'),
      zero: token<number>('zero'),
      undefined: token<undefined>('undefined'),
    };

    const firstContainer = new Container();
    firstContainer.bind(tokens.null).toCall(createNull).inGlobalScope();
    firstContainer.bind(tokens.false).toCall(createFalse).inGlobalScope();
    firstContainer.bind(tokens.zero).toCall(createZero).inGlobalScope();
    firstContainer
      .bind(tokens.undefined)
      .toCall(createUndefined)
      .inGlobalScope();

    const secondContainer = new Container();
    secondContainer.bind(tokens.null).toCall(createNull).inGlobalScope();
    secondContainer.bind(tokens.false).toCall(createFalse).inGlobalScope();
    secondContainer.bind(tokens.zero).toCall(createZero).inGlobalScope();
    secondContainer
      .bind(tokens.undefined)
      .toCall(createUndefined)
      .inGlobalScope();

    firstContainer.get(tokens.null);
    secondContainer.get(tokens.null);
    firstContainer.get(tokens.false);
    secondContainer.get(tokens.false);
    firstContainer.get(tokens.zero);
    secondContainer.get(tokens.zero);
    firstContainer.get(tokens.undefined);
    secondContainer.get(tokens.undefined);

    expect(createNull).toHaveBeenCalledTimes(1);
    expect(createFalse).toHaveBeenCalledTimes(1);
    expect(createZero).toHaveBeenCalledTimes(1);
    expect(createUndefined).toHaveBeenCalledTimes(2);
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
