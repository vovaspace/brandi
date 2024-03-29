import { Container, DependencyModule, createContainer, token } from '../src';

import { setEnv } from './utils';

describe('container', () => {
  it('throws error when the token was not bound', () => {
    const TOKENS = {
      some: token<unknown>('some'),
    };

    const container = new Container();

    expect(() => container.get(TOKENS.some)).toThrowErrorMatchingSnapshot();
  });

  it("returns an unlinked container from 'clone' method", () => {
    const parentValue = 1;
    const someValue = 2;
    const anotherValue = 3;
    const copiedValue = 4;

    const TOKENS = {
      parent: token<number>('parent'),
      original: token<number>('original'),
      copied: token<number>('copied'),
    };

    const parentContainer = new Container();
    parentContainer.bind(TOKENS.parent).toConstant(parentValue);

    const originalContainer = new Container().extend(parentContainer);
    originalContainer.bind(TOKENS.original).toConstant(someValue);

    const copiedContainer = originalContainer.clone();
    copiedContainer.bind(TOKENS.original).toConstant(anotherValue);
    copiedContainer.bind(TOKENS.copied).toConstant(copiedValue);

    expect(originalContainer.get(TOKENS.original)).toBe(someValue);
    expect(() =>
      originalContainer.get(TOKENS.copied),
    ).toThrowErrorMatchingSnapshot();

    expect(copiedContainer.get(TOKENS.parent)).toBe(parentValue);
    expect(copiedContainer.get(TOKENS.original)).toBe(anotherValue);
    expect(copiedContainer.get(TOKENS.copied)).toBe(copiedValue);
  });

  it('returns a dependency from the parent container', () => {
    const value = 1;

    const TOKENS = {
      value: token<number>('value'),
    };

    const parentContainer = new Container();
    parentContainer.bind(TOKENS.value).toConstant(value);

    const childContainer = new Container().extend(parentContainer);

    expect(childContainer.get(TOKENS.value)).toBe(value);
  });

  it('changes parent container', () => {
    const firstValue = 1;
    const secondValue = 2;

    const TOKENS = {
      value: token<number>('value'),
    };

    const firstContainer = new Container();
    firstContainer.bind(TOKENS.value).toConstant(firstValue);

    const secondContainer = new Container();
    secondContainer.bind(TOKENS.value).toConstant(secondValue);

    const container = new Container().extend(firstContainer);

    expect(container.get(TOKENS.value)).toBe(firstValue);

    container.extend(secondContainer);

    expect(container.get(TOKENS.value)).toBe(secondValue);
  });

  it('clears parent container', () => {
    const value = 1;

    const TOKENS = {
      value: token<number>('value'),
    };

    const parentContainer = new Container();
    parentContainer.bind(TOKENS.value).toConstant(value);

    const childContainer = new Container().extend(parentContainer);

    expect(childContainer.get(TOKENS.value)).toBe(value);

    childContainer.extend(null);

    expect(() =>
      childContainer.get(TOKENS.value),
    ).toThrowErrorMatchingSnapshot();
  });

  it("rebinds a parent container's binding in the child container", () => {
    const someValue = 1;
    const anotherValue = 2;

    const TOKENS = {
      value: token<number>('value'),
    };

    const parentContainer = new Container();
    parentContainer.bind(TOKENS.value).toConstant(someValue);

    const childContainer = new Container().extend(parentContainer);
    childContainer.bind(TOKENS.value).toConstant(anotherValue);

    expect(parentContainer.get(TOKENS.value)).toBe(someValue);
    expect(childContainer.get(TOKENS.value)).toBe(anotherValue);
  });

  it('captures the container bindings to a snapshot', () => {
    const someValue = 1;
    const anotherValue = 2;
    const additionalValue = 3;

    const TOKENS = {
      value: token<number>('value'),
      additional: token<number>('additional'),
    };

    const container = new Container();
    container.bind(TOKENS.value).toConstant(someValue);

    container.capture!();

    container.bind(TOKENS.value).toConstant(anotherValue);
    container.bind(TOKENS.additional).toConstant(additionalValue);

    expect(container.get(TOKENS.value)).toBe(anotherValue);
    expect(container.get(TOKENS.additional)).toBe(additionalValue);

    container.restore!();

    expect(container.get(TOKENS.value)).toBe(someValue);
    expect(() =>
      container.get(TOKENS.additional),
    ).toThrowErrorMatchingSnapshot();

    container.bind(TOKENS.value).toConstant(anotherValue);
    container.bind(TOKENS.additional).toConstant(additionalValue);

    expect(container.get(TOKENS.value)).toBe(anotherValue);
    expect(container.get(TOKENS.additional)).toBe(additionalValue);

    container.restore!();

    expect(container.get(TOKENS.value)).toBe(someValue);
    expect(() =>
      container.get(TOKENS.additional),
    ).toThrowErrorMatchingSnapshot();
  });

  it('captures the container parent to a snapshot', () => {
    const firstValue = 1;
    const secondValue = 2;

    const TOKENS = {
      value: token<number>('value'),
    };

    const firstContainer = new Container();
    firstContainer.bind(TOKENS.value).toConstant(firstValue);

    const secondContainer = new Container();
    secondContainer.bind(TOKENS.value).toConstant(secondValue);

    const container = new Container().extend(firstContainer);

    container.capture!();

    container.extend(secondContainer);

    expect(container.get(TOKENS.value)).toBe(secondValue);

    container.restore!();

    expect(container.get(TOKENS.value)).toBe(firstValue);

    container.extend(secondContainer);

    expect(container.get(TOKENS.value)).toBe(secondValue);

    container.restore!();

    expect(container.get(TOKENS.value)).toBe(firstValue);
  });

  it('captures a singleton scoped binding state to a snapshot', () => {
    class Singleton {}

    const TOKENS = {
      some: token<Singleton>('some'),
      another: token<Singleton>('another'),
    };

    const container = new Container();
    container.bind(TOKENS.some).toInstance(Singleton).inSingletonScope();
    container.bind(TOKENS.another).toInstance(Singleton).inSingletonScope();

    const firstSomeInstance = container.get(TOKENS.some);

    container.capture!();

    const secondSomeInstance = container.get(TOKENS.some);
    const firstAnotherInstance = container.get(TOKENS.another);

    container.restore!();
    container.capture!();

    const thirdSomeInstance = container.get(TOKENS.some);
    const secondAnotherInstance = container.get(TOKENS.another);

    container.restore!();

    const fourthSomeInstance = container.get(TOKENS.some);
    const thirdAnotherInstance = container.get(TOKENS.another);

    container.restore!();

    const fifthSomeInstance = container.get(TOKENS.some);
    const fourthAnotherInstance = container.get(TOKENS.another);

    expect(firstSomeInstance).toBe(secondSomeInstance);
    expect(secondSomeInstance).toBe(thirdSomeInstance);
    expect(thirdSomeInstance).toBe(fourthSomeInstance);
    expect(fourthSomeInstance).toBe(fifthSomeInstance);

    expect(firstAnotherInstance).not.toBe(secondAnotherInstance);
    expect(secondAnotherInstance).not.toBe(thirdAnotherInstance);
    expect(thirdAnotherInstance).not.toBe(fourthAnotherInstance);
  });

  it('captures a container scoped binding state to a snapshot', () => {
    class Some {}

    const TOKENS = {
      some: token<Some>('some'),
      another: token<Some>('another'),
    };

    const container = new Container();
    container.bind(TOKENS.some).toInstance(Some).inContainerScope();
    container.bind(TOKENS.another).toInstance(Some).inContainerScope();

    const firstSomeInstance = container.get(TOKENS.some);

    container.capture!();

    const secondSomeInstance = container.get(TOKENS.some);
    const firstAnotherInstance = container.get(TOKENS.another);

    container.restore!();
    container.capture!();

    const thirdSomeInstance = container.get(TOKENS.some);
    const secondAnotherInstance = container.get(TOKENS.another);

    container.restore!();

    const fourthSomeInstance = container.get(TOKENS.some);
    const thirdAnotherInstance = container.get(TOKENS.another);

    container.restore!();

    const fifthSomeInstance = container.get(TOKENS.some);
    const fourthAnotherInstance = container.get(TOKENS.another);

    expect(firstSomeInstance).toBe(secondSomeInstance);
    expect(secondSomeInstance).not.toBe(thirdSomeInstance);
    expect(thirdSomeInstance).not.toBe(fourthSomeInstance);
    expect(fourthSomeInstance).not.toBe(fifthSomeInstance);

    expect(firstAnotherInstance).not.toBe(secondAnotherInstance);
    expect(secondAnotherInstance).not.toBe(thirdAnotherInstance);
    expect(thirdAnotherInstance).not.toBe(fourthAnotherInstance);
  });

  it('captures a dependency module state to a snapshot', () => {
    class Some {}

    const TOKENS = {
      some: token<Some>('some'),
    };

    const dependencyModule = new DependencyModule();
    dependencyModule.bind(TOKENS.some).toInstance(Some).inSingletonScope();

    const container = new Container();
    container.use(TOKENS.some).from(dependencyModule);

    container.capture!();
    const firstSomeInstance = container.get(TOKENS.some);

    container.restore!();
    container.capture!();
    const secondSomeInstance = container.get(TOKENS.some);

    container.restore!();
    const thirdSomeInstance = container.get(TOKENS.some);

    container.restore!();
    const fourthSomeInstance = container.get(TOKENS.some);

    expect(firstSomeInstance).not.toBe(secondSomeInstance);
    expect(secondSomeInstance).not.toBe(thirdSomeInstance);
    expect(thirdSomeInstance).not.toBe(fourthSomeInstance);
  });

  it('logs an error when trying to restore a non-captured container state', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => null);

    const container = new Container();
    container.restore!();

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0]?.[0]).toMatchSnapshot();

    spy.mockRestore();
  });

  it('does not log an error when restoring the captured container state', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => null);

    const container = new Container();
    container.capture!();
    container.restore!();

    expect(spy).toHaveBeenCalledTimes(0);

    spy.mockRestore();
  });

  it("does not include capturing in 'production' env", () => {
    const restoreEnv = setEnv('production');

    const container = new Container();

    expect(container.capture).toBeUndefined();
    expect(container.restore).toBeUndefined();

    restoreEnv();
  });

  it("creates a container by 'createContainer'", () => {
    expect(createContainer()).toBeInstanceOf(Container);
  });

  describe('typings', () => {
    it('does not allow to bind an optional token', () => {
      expect.assertions(0);

      const TOKENS = {
        some: token<number>('some'),
      };

      const container = new Container();

      // @ts-expect-error: Argument of type 'OptionalToken<number>' is not assignable to parameter of type 'Token<unknown>'.
      container.bind(TOKENS.some.optional);
    });
  });
});
