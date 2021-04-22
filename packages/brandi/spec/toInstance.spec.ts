import { Container, injected, token } from '../src';

import { setEnv } from './utils';

jest.useFakeTimers();

describe('toInstance', () => {
  it('creates instances in transient scope', () => {
    class SomeClass {}

    const tokens = {
      someClass: token<SomeClass>('someClass'),
    };

    const container = new Container();
    container.bind(tokens.someClass).toInstance(SomeClass).inTransientScope();

    const firstInstance = container.get(tokens.someClass);
    const secondInstance = container.get(tokens.someClass);

    expect(firstInstance).toBeInstanceOf(SomeClass);
    expect(secondInstance).toBeInstanceOf(SomeClass);
    expect(firstInstance).not.toBe(secondInstance);
  });

  it('creates instances in singleton scope', () => {
    class SomeClass {}

    const tokens = {
      someClass: token<SomeClass>('someClass'),
    };

    const container = new Container();
    container.bind(tokens.someClass).toInstance(SomeClass).inSingletonScope();

    const firstInstance = container.get(tokens.someClass);
    const secondInstance = container.get(tokens.someClass);

    expect(firstInstance).toBeInstanceOf(SomeClass);
    expect(secondInstance).toBeInstanceOf(SomeClass);
    expect(firstInstance).toBe(secondInstance);
  });

  it('creates singleton scoped instances unique to its bindings', () => {
    class SomeClass {}

    const tokens = {
      someClass: token<SomeClass>('someClass'),
    };

    const parentContainer = new Container();
    const childContainer = new Container(parentContainer);

    parentContainer
      .bind(tokens.someClass)
      .toInstance(SomeClass)
      .inSingletonScope();

    childContainer
      .bind(tokens.someClass)
      .toInstance(SomeClass)
      .inSingletonScope();

    const parentInstance = parentContainer.get(tokens.someClass);
    const childInstance = childContainer.get(tokens.someClass);

    expect(parentInstance).toBeInstanceOf(SomeClass);
    expect(childInstance).toBeInstanceOf(SomeClass);
    expect(parentInstance).not.toBe(childInstance);
  });

  it('shares a singleton between the original container and its copy', () => {
    class SomeClass {}

    const tokens = {
      someClass: token<SomeClass>('someClass'),
    };

    const originalContainer = new Container();

    originalContainer
      .bind(tokens.someClass)
      .toInstance(SomeClass)
      .inSingletonScope();

    const copiedContainer = originalContainer.clone();

    const copiedContainerInstance = copiedContainer.get(tokens.someClass);
    const originalContainerInstance = originalContainer.get(tokens.someClass);

    expect(copiedContainerInstance).toBe(originalContainerInstance);
  });

  it('creates instances with injections', () => {
    const someValue = 1;

    class FirstClass {}

    class SecondClass {}

    class ThirdClass {
      constructor(
        public value: number,
        public first: FirstClass,
        public second: SecondClass,
      ) {}
    }

    const tokens = {
      someValue: token<number>('someValue'),
      firstClass: token<FirstClass>('firstClass'),
      secondClass: token<SecondClass>('secondClass'),
      thirdClass: token<ThirdClass>('thirdClass'),
    };

    injected(
      ThirdClass,
      tokens.someValue,
      tokens.firstClass,
      tokens.secondClass,
    );

    const container = new Container();
    container.bind(tokens.someValue).toConstant(someValue);
    container.bind(tokens.firstClass).toInstance(FirstClass).inTransientScope();
    container
      .bind(tokens.secondClass)
      .toInstance(SecondClass)
      .inSingletonScope();
    container.bind(tokens.thirdClass).toInstance(ThirdClass).inTransientScope();

    const firstThirdClassInstance = container.get(tokens.thirdClass);
    const secondThirdClassInstance = container.get(tokens.thirdClass);

    expect(firstThirdClassInstance.value).toBe(someValue);
    expect(secondThirdClassInstance.value).toBe(someValue);

    expect(firstThirdClassInstance.first).toBeInstanceOf(FirstClass);
    expect(secondThirdClassInstance.first).toBeInstanceOf(FirstClass);
    expect(firstThirdClassInstance.first).not.toBe(
      secondThirdClassInstance.first,
    );

    expect(firstThirdClassInstance.second).toBeInstanceOf(SecondClass);
    expect(secondThirdClassInstance.second).toBeInstanceOf(SecondClass);
    expect(firstThirdClassInstance.second).toBe(
      secondThirdClassInstance.second,
    );
  });

  it('creates an instance with an injection from the parent container', () => {
    const someValue = 1;

    class SomeClass {
      constructor(public value: number) {}
    }

    const tokens = {
      someValue: token<number>('someValue'),
      someClass: token<SomeClass>('someClass'),
    };

    injected(SomeClass, tokens.someValue);

    const parentContainer = new Container();
    parentContainer.bind(tokens.someValue).toConstant(someValue);

    const childContainer = new Container(parentContainer);
    childContainer
      .bind(tokens.someClass)
      .toInstance(SomeClass)
      .inTransientScope();

    const instance = childContainer.get(tokens.someClass);

    expect(instance.value).toBe(someValue);
  });

  it('creates an instance with an injection from the container from which the instance was got', () => {
    const someValue = 1;
    const anotherValue = 2;

    class SomeClass {
      constructor(public value: number) {}
    }

    const tokens = {
      someValue: token<number>('someValue'),
      someClass: token<SomeClass>('someClass'),
    };

    injected(SomeClass, tokens.someValue);

    const parentContainer = new Container();
    parentContainer.bind(tokens.someValue).toConstant(someValue);
    parentContainer
      .bind(tokens.someClass)
      .toInstance(SomeClass)
      .inTransientScope();

    const childContainer = new Container(parentContainer);
    childContainer.bind(tokens.someValue).toConstant(anotherValue);

    const parentContainerInstance = parentContainer.get(tokens.someClass);
    const childContainerInstance = childContainer.get(tokens.someClass);

    expect(parentContainerInstance.value).toBe(someValue);
    expect(childContainerInstance.value).toBe(anotherValue);
  });

  it('creates instances in container scope', () => {
    class SomeClass {}

    const tokens = {
      someClass: token<SomeClass>('someClass'),
    };

    const parentContainer = new Container();
    parentContainer
      .bind(tokens.someClass)
      .toInstance(SomeClass)
      .inContainerScope();

    const childContainer = new Container(parentContainer);

    const parentContainerFirstInstance = parentContainer.get(tokens.someClass);
    const parentContainerSecondInstance = parentContainer.get(tokens.someClass);
    const childContainerFirstInstance = childContainer.get(tokens.someClass);
    const childContainerSecondInstance = childContainer.get(tokens.someClass);

    expect(parentContainerFirstInstance).toBe(parentContainerSecondInstance);
    expect(childContainerFirstInstance).toBe(childContainerSecondInstance);

    expect(parentContainerFirstInstance).not.toBe(childContainerFirstInstance);
  });

  it('creates instances in resolution scope', () => {
    class FirstClass {}

    class SecondClass {
      constructor(public first: FirstClass) {}
    }

    class ThirdClass {
      constructor(public first: FirstClass, public second: SecondClass) {}
    }

    class FourthClass {
      constructor(
        public first: FirstClass,
        public second: SecondClass,
        public third: ThirdClass,
      ) {}
    }

    const tokens = {
      firstClass: token<FirstClass>('firstClass'),
      secondClass: token<SecondClass>('secondClass'),
      thirdClass: token<ThirdClass>('thirdClass'),
      fourthClass: token<FourthClass>('fourthClass'),
    };

    injected(SecondClass, tokens.firstClass);
    injected(ThirdClass, tokens.firstClass, tokens.secondClass);
    injected(
      FourthClass,
      tokens.firstClass,
      tokens.secondClass,
      tokens.thirdClass,
    );

    const container = new Container();

    container
      .bind(tokens.firstClass)
      .toInstance(FirstClass)
      .inResolutionScope();
    container
      .bind(tokens.secondClass)
      .toInstance(SecondClass)
      .inResolutionScope();
    container.bind(tokens.thirdClass).toInstance(ThirdClass).inTransientScope();
    container
      .bind(tokens.fourthClass)
      .toInstance(FourthClass)
      .inTransientScope();

    const instance = container.get(tokens.fourthClass);

    expect(instance.first).toBe(instance.second.first);
    expect(instance.first).toBe(instance.third.first);
    expect(instance.first).toBe(instance.third.second.first);
    expect(instance.second).toBe(instance.third.second);
  });

  it('creates instances in global scope', () => {
    class SomeClass {}

    const tokens = {
      someClass: token<SomeClass>('someClass'),
      secondSomeClass: token<SomeClass>('anotherSomeClass'),
    };

    const parentContainer = new Container();
    const childContainer = new Container(parentContainer);
    const independentContainer = new Container();

    parentContainer
      .bind(tokens.someClass)
      .toInstance(SomeClass)
      .inGlobalScope();
    parentContainer
      .bind(tokens.secondSomeClass)
      .toInstance(SomeClass)
      .inGlobalScope();

    childContainer.bind(tokens.someClass).toInstance(SomeClass).inGlobalScope();
    childContainer
      .bind(tokens.secondSomeClass)
      .toInstance(SomeClass)
      .inGlobalScope();

    independentContainer
      .bind(tokens.someClass)
      .toInstance(SomeClass)
      .inGlobalScope();
    independentContainer
      .bind(tokens.secondSomeClass)
      .toInstance(SomeClass)
      .inGlobalScope();

    const parentInstance = parentContainer.get(tokens.someClass);
    const parentSecondInstance = parentContainer.get(tokens.secondSomeClass);
    const childInstance = childContainer.get(tokens.someClass);
    const childSecondInstance = childContainer.get(tokens.secondSomeClass);
    const independentInstance = independentContainer.get(tokens.someClass);
    const independentSecondInstance = independentContainer.get(
      tokens.secondSomeClass,
    );

    expect(parentInstance).toBeInstanceOf(SomeClass);
    expect(parentSecondInstance).toBeInstanceOf(SomeClass);
    expect(childInstance).toBeInstanceOf(SomeClass);
    expect(childSecondInstance).toBeInstanceOf(SomeClass);
    expect(independentInstance).toBeInstanceOf(SomeClass);
    expect(independentSecondInstance).toBeInstanceOf(SomeClass);

    expect(parentInstance).toBe(parentSecondInstance);
    expect(parentInstance).toBe(childInstance);
    expect(childInstance).toBe(childSecondInstance);
    expect(childInstance).toBe(independentInstance);
    expect(independentInstance).toBe(independentSecondInstance);
  });

  it('throws error when trying to construct an instance with required constructor arguments when the target class was not injected', () => {
    class SomeClass {
      constructor(public dependency: unknown) {}
    }

    const tokens = {
      someClass: token('someClass'),
    };

    const container = new Container();
    container.bind(tokens.someClass).toInstance(SomeClass).inTransientScope();

    expect(() =>
      container.get(tokens.someClass),
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
});
