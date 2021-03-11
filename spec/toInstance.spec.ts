import { Container, injected, tag, tagged, token } from '../src';

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
    container.bind(tokens.someValue).toValue(someValue);
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
    parentContainer.bind(tokens.someValue).toValue(someValue);

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
    parentContainer.bind(tokens.someValue).toValue(someValue);
    parentContainer
      .bind(tokens.someClass)
      .toInstance(SomeClass)
      .inTransientScope();

    const childContainer = new Container(parentContainer);
    childContainer.bind(tokens.someValue).toValue(anotherValue);

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

  it('creates an instance with an injection that depends on the tag', () => {
    const someValue = 1;
    const anotherValue = 2;

    class SomeClass {
      constructor(public value: number) {}
    }

    class AnotherClass {
      constructor(public value: number) {}
    }

    const tokens = {
      someValue: token<number>('someValue'),
      someClass: token<SomeClass>('someClass'),
      anotherClass: token<AnotherClass>('anotherClass'),
    };

    const tags = {
      some: tag('some'),
    };

    injected(SomeClass, tokens.someValue);
    injected(AnotherClass, tokens.someValue);

    tagged(AnotherClass, tags.some);

    const container = new Container();
    container.bind(tokens.someValue).toValue(someValue);
    container.when(tags.some).bind(tokens.someValue).toValue(anotherValue);
    container.bind(tokens.someClass).toInstance(SomeClass).inTransientScope();
    container
      .bind(tokens.anotherClass)
      .toInstance(AnotherClass)
      .inTransientScope();

    const someClassInstance = container.get(tokens.someClass);
    const anotherClassInstance = container.get(tokens.anotherClass);

    expect(someClassInstance.value).toBe(someValue);
    expect(anotherClassInstance.value).toBe(anotherValue);
  });

  it('ignores a unused tag on the target class', () => {
    const someValue = 1;

    class SomeClass {
      constructor(public value: number) {}
    }

    const tokens = {
      someValue: token<number>('someValue'),
      someClass: token<SomeClass>('someClass'),
    };

    const tags = {
      unused: tag('unused'),
    };

    injected(SomeClass, tokens.someValue);

    tagged(SomeClass, tags.unused);

    const container = new Container();
    container.bind(tokens.someValue).toValue(someValue);
    container.bind(tokens.someClass).toInstance(SomeClass).inTransientScope();

    const instance = container.get(tokens.someClass);

    expect(instance.value).toBe(someValue);
  });

  it('throws when trying to construct an instance with constructor arguments when the target class was not injected', () => {
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

  it("logs a warning when a binding scope setting method was not called in 'development' env", () => {
    const restoreEnv = setEnv('development');
    const spy = jest.spyOn(console, 'warn').mockImplementation(() => null);

    const container = new Container();
    container.bind(token<unknown>('unknown')).toInstance(class {});

    jest.runAllTimers();

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0]?.[0]).toMatchSnapshot();

    restoreEnv();
    spy.mockRestore();
  });

  it('does not log a warning when a binding scope setting method was called', () => {
    const restoreEnv = setEnv('development');
    const spy = jest.spyOn(console, 'warn').mockImplementation(() => null);

    const container = new Container();
    container
      .bind(token<unknown>('unknown'))
      .toInstance(class {})
      .inTransientScope();

    jest.runAllTimers();

    expect(spy).toHaveBeenCalledTimes(0);

    restoreEnv();
    spy.mockRestore();
  });

  it("skips the logging in non-'development' env", () => {
    const restoreEnv = setEnv('non-development');
    const spy = jest.spyOn(console, 'warn').mockImplementation(() => null);

    const container = new Container();
    container.bind(token<unknown>('unknown')).toInstance(class {});

    expect(spy).toHaveBeenCalledTimes(0);

    restoreEnv();
    spy.mockRestore();
  });
});
