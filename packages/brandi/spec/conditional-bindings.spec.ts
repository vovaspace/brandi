import { Container, injected, tag, tagged, token } from '../src';

import { setEnv } from './utils';

describe('conditional bindings', () => {
  it('creates an instance with an injection that depends on the target', () => {
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

    injected(SomeClass, tokens.someValue);
    injected(AnotherClass, tokens.someValue);

    const container = new Container();

    container.bind(tokens.someValue).toConstant(someValue);
    container
      .when(AnotherClass)
      .bind(tokens.someValue)
      .toConstant(anotherValue);

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

    container.bind(tokens.someValue).toConstant(someValue);
    container.when(tags.some).bind(tokens.someValue).toConstant(anotherValue);

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

  it('injects a dependency by the target condition when there are conditions for both the target and the tag', () => {
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
    tagged(SomeClass, tags.some);

    injected(AnotherClass, tokens.someValue);
    tagged(AnotherClass, tags.some);

    const container = new Container();

    container.when(tags.some).bind(tokens.someValue).toConstant(someValue);
    container
      .when(AnotherClass)
      .bind(tokens.someValue)
      .toConstant(anotherValue);

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

  it('ignores an unused tag on the target', () => {
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
    container.bind(tokens.someValue).toConstant(someValue);
    container.bind(tokens.someClass).toInstance(SomeClass).inTransientScope();

    const instance = container.get(tokens.someClass);

    expect(instance.value).toBe(someValue);
  });

  it('injects a dependency by conditions from the parent container', () => {
    const defaultValue = 1;
    const someValue = 2;
    const anotherValue = 3;

    class SomeClass {
      constructor(public value: number) {}
    }
    class AnotherClass {
      constructor(public value: number) {}
    }

    const tokens = {
      value: token<number>('value'),
      someClass: token<SomeClass>('someClass'),
      anotherClass: token<AnotherClass>('anotherClass'),
    };

    const tags = {
      some: tag('some'),
    };

    injected(SomeClass, tokens.value);
    tagged(SomeClass, tags.some);

    injected(AnotherClass, tokens.value);

    const parentContainer = new Container();

    parentContainer.bind(tokens.value).toConstant(defaultValue);
    parentContainer.when(tags.some).bind(tokens.value).toConstant(someValue);
    parentContainer
      .when(AnotherClass)
      .bind(tokens.value)
      .toConstant(anotherValue);

    const childContainer = new Container(parentContainer);
    childContainer
      .bind(tokens.someClass)
      .toInstance(SomeClass)
      .inTransientScope();
    childContainer
      .bind(tokens.anotherClass)
      .toInstance(AnotherClass)
      .inTransientScope();

    const someInstance = childContainer.get(tokens.someClass);
    const anotherInstance = childContainer.get(tokens.anotherClass);

    expect(someInstance.value).toBe(someValue);
    expect(anotherInstance.value).toBe(anotherValue);
  });

  it('takes a binding by the tag assigned first with multiple related tags on the target', () => {
    const spy = jest.spyOn(console, 'warn').mockImplementation(() => null);

    const someValue = 1;
    const anotherValue = 2;
    const otherValue = 3;

    class SomeClass {
      constructor(public value: number) {}
    }

    const tokens = {
      someValue: token<number>('someValue'),
      someClass: token<SomeClass>('someClass'),
    };

    const tags = {
      some: tag('some'),
      another: tag('another'),
      other: tag('other'),
    };

    injected(SomeClass, tokens.someValue);
    tagged(SomeClass, tags.some, tags.another, tags.other);

    const container = new Container();

    container.when(tags.other).bind(tokens.someValue).toConstant(otherValue);
    container.when(tags.some).bind(tokens.someValue).toConstant(someValue);
    container
      .when(tags.another)
      .bind(tokens.someValue)
      .toConstant(anotherValue);

    container.bind(tokens.someClass).toInstance(SomeClass).inTransientScope();

    const instance = container.get(tokens.someClass);

    expect(instance.value).toBe(someValue);

    spy.mockRestore();
  });

  it('logs a warning when multiple related tags are on the target', () => {
    const spy = jest.spyOn(console, 'warn').mockImplementation(() => null);

    class SomeClass {
      constructor(public value: number) {}
    }

    const tokens = {
      someValue: token<number>('someValue'),
      someClass: token<SomeClass>('someClass'),
    };

    const tags = {
      some: tag('some'),
      another: tag('another'),
    };

    injected(SomeClass, tokens.someValue);
    tagged(SomeClass, tags.some, tags.another);

    const container = new Container();

    container.when(tags.another).bind(tokens.someValue).toConstant(0);
    container.when(tags.some).bind(tokens.someValue).toConstant(0);

    container.bind(tokens.someClass).toInstance(SomeClass).inTransientScope();

    container.get(tokens.someClass);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0]?.[0]).toMatchSnapshot();

    spy.mockRestore();
  });

  it('does not log a warning when a single related tag are on the target', () => {
    const spy = jest.spyOn(console, 'warn').mockImplementation(() => null);

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

    container.bind(tokens.someValue).toConstant(0);
    container.when(tags.some).bind(tokens.someValue).toConstant(0);

    container.bind(tokens.someClass).toInstance(SomeClass).inTransientScope();
    container
      .bind(tokens.anotherClass)
      .toInstance(AnotherClass)
      .inTransientScope();

    container.get(tokens.someClass);
    container.get(tokens.anotherClass);

    expect(spy).toHaveBeenCalledTimes(0);

    spy.mockRestore();
  });

  it("skips the logging in 'production' env", () => {
    const restoreEnv = setEnv('production');
    const spy = jest.spyOn(console, 'warn').mockImplementation(() => null);

    class SomeClass {
      constructor(public value: number) {}
    }

    const tokens = {
      someValue: token<number>('someValue'),
      someClass: token<SomeClass>('someClass'),
    };

    const tags = {
      some: tag('some'),
      another: tag('another'),
    };

    injected(SomeClass, tokens.someValue);
    tagged(SomeClass, tags.some, tags.another);

    const container = new Container();

    container.when(tags.another).bind(tokens.someValue).toConstant(0);
    container.when(tags.some).bind(tokens.someValue).toConstant(0);

    container.bind(tokens.someClass).toInstance(SomeClass).inTransientScope();

    container.get(tokens.someClass);

    expect(spy).toHaveBeenCalledTimes(0);

    restoreEnv();
    spy.mockRestore();
  });

  describe('Container.get', () => {
    it('returns a dependency with a condition', () => {
      const spy = jest.spyOn(console, 'warn').mockImplementation(() => null);

      const someValue = 1;
      const anotherValue = 2;
      const otherValue = 3;

      class SomeClass {
        constructor(public value: number) {}
      }

      const tokens = {
        someValue: token<number>('someValue'),
      };

      const tags = {
        some: tag('some'),
      };

      injected(SomeClass, tokens.someValue);

      const container = new Container();

      container.bind(tokens.someValue).toConstant(someValue);
      container.when(tags.some).bind(tokens.someValue).toConstant(anotherValue);
      container.when(SomeClass).bind(tokens.someValue).toConstant(otherValue);

      expect(container.get(tokens.someValue)).toBe(someValue);
      expect(container.get(tokens.someValue, [])).toBe(someValue);
      expect(container.get(tokens.someValue, [tags.some])).toBe(anotherValue);
      expect(container.get(tokens.someValue, [SomeClass])).toBe(otherValue);
      expect(container.get(tokens.someValue, [tags.some, SomeClass])).toBe(
        anotherValue,
      );
      expect(container.get(tokens.someValue, [SomeClass, tags.some])).toBe(
        otherValue,
      );

      spy.mockRestore();
    });

    it('logs a warning when multiple related conditions were passed', () => {
      const spy = jest.spyOn(console, 'warn').mockImplementation(() => null);

      class SomeClass {
        constructor(public value: number) {}
      }

      const tokens = {
        someValue: token<number>('someValue'),
      };

      const tags = {
        some: tag('some'),
      };

      injected(SomeClass, tokens.someValue);

      const container = new Container();

      container.bind(tokens.someValue).toConstant(0);
      container.when(tags.some).bind(tokens.someValue).toConstant(0);
      container.when(SomeClass).bind(tokens.someValue).toConstant(0);

      container.get(tokens.someValue, [SomeClass, tags.some]);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy.mock.calls[0]?.[0]).toMatchSnapshot();

      spy.mockRestore();
    });

    it('does not log a warning when a single related condition were passed', () => {
      const spy = jest.spyOn(console, 'warn').mockImplementation(() => null);

      class SomeClass {
        constructor(public value: number) {}
      }

      const tokens = {
        someValue: token<number>('someValue'),
      };

      const tags = {
        some: tag('some'),
      };

      injected(SomeClass, tokens.someValue);

      const container = new Container();

      container.bind(tokens.someValue).toConstant(0);
      container.when(tags.some).bind(tokens.someValue).toConstant(0);
      container.when(SomeClass).bind(tokens.someValue).toConstant(0);

      container.get(tokens.someValue, [SomeClass]);
      container.get(tokens.someValue, [tags.some]);

      expect(spy).toHaveBeenCalledTimes(0);

      spy.mockRestore();
    });

    it("skips the logging in 'production' env", () => {
      const restoreEnv = setEnv('production');
      const spy = jest.spyOn(console, 'warn').mockImplementation(() => null);

      class SomeClass {
        constructor(public value: number) {}
      }

      const tokens = {
        someValue: token<number>('someValue'),
      };

      const tags = {
        some: tag('some'),
      };

      injected(SomeClass, tokens.someValue);

      const container = new Container();

      container.bind(tokens.someValue).toConstant(0);
      container.when(tags.some).bind(tokens.someValue).toConstant(0);
      container.when(SomeClass).bind(tokens.someValue).toConstant(0);

      container.get(tokens.someValue, [SomeClass, tags.some]);

      expect(spy).toHaveBeenCalledTimes(0);

      restoreEnv();
      spy.mockRestore();
    });
  });
});
