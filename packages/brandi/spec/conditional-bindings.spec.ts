import { Container, injected, tag, tagged, token } from '../src';

import { setEnv } from './utils';

describe('conditional bindings', () => {
  it('creates an instance with an injection that depends on the target', () => {
    const someValue = 1;
    const anotherValue = 2;

    class Some {
      constructor(public num: number) {}
    }

    class Another {
      constructor(public num: number) {}
    }

    const TOKENS = {
      num: token<number>('num'),
      some: token<Some>('some'),
      another: token<Another>('another'),
    };

    injected(Some, TOKENS.num);
    injected(Another, TOKENS.num);

    const container = new Container();

    container.bind(TOKENS.num).toConstant(someValue);
    container.when(Another).bind(TOKENS.num).toConstant(anotherValue);

    container.bind(TOKENS.some).toInstance(Some).inTransientScope();
    container.bind(TOKENS.another).toInstance(Another).inTransientScope();

    const someInstance = container.get(TOKENS.some);
    const anotherInstance = container.get(TOKENS.another);

    expect(someInstance.num).toBe(someValue);
    expect(anotherInstance.num).toBe(anotherValue);
  });

  it('creates an instance with an injection that depends on the tag', () => {
    const someValue = 1;
    const anotherValue = 2;

    class Some {
      constructor(public num: number) {}
    }

    class Another {
      constructor(public num: number) {}
    }

    const TOKENS = {
      num: token<number>('num'),
      some: token<Some>('some'),
      another: token<Another>('another'),
    };

    const TAGS = {
      some: tag('some'),
    };

    injected(Some, TOKENS.num);

    injected(Another, TOKENS.num);
    tagged(Another, TAGS.some);

    const container = new Container();

    container.bind(TOKENS.num).toConstant(someValue);
    container.when(TAGS.some).bind(TOKENS.num).toConstant(anotherValue);

    container.bind(TOKENS.some).toInstance(Some).inTransientScope();
    container.bind(TOKENS.another).toInstance(Another).inTransientScope();

    const someInstance = container.get(TOKENS.some);
    const anotherInstance = container.get(TOKENS.another);

    expect(someInstance.num).toBe(someValue);
    expect(anotherInstance.num).toBe(anotherValue);
  });

  it('injects a dependency by the target condition when there are conditions for both the target and the tag', () => {
    const someValue = 1;
    const anotherValue = 2;

    class Some {
      constructor(public num: number) {}
    }

    class Another {
      constructor(public num: number) {}
    }

    const TOKENS = {
      num: token<number>('num'),
      some: token<Some>('some'),
      another: token<Another>('another'),
    };

    const TAGS = {
      some: tag('some'),
    };

    injected(Some, TOKENS.num);
    tagged(Some, TAGS.some);

    injected(Another, TOKENS.num);
    tagged(Another, TAGS.some);

    const container = new Container();

    container.when(TAGS.some).bind(TOKENS.num).toConstant(someValue);
    container.when(Another).bind(TOKENS.num).toConstant(anotherValue);

    container.bind(TOKENS.some).toInstance(Some).inTransientScope();
    container.bind(TOKENS.another).toInstance(Another).inTransientScope();

    const someInstance = container.get(TOKENS.some);
    const anotherInstance = container.get(TOKENS.another);

    expect(someInstance.num).toBe(someValue);
    expect(anotherInstance.num).toBe(anotherValue);
  });

  it('ignores an unused tag on the target', () => {
    const someValue = 1;

    class Some {
      constructor(public num: number) {}
    }

    const TOKENS = {
      num: token<number>('num'),
      some: token<Some>('some'),
    };

    const TAGS = {
      unused: tag('unused'),
    };

    injected(Some, TOKENS.num);

    tagged(Some, TAGS.unused);

    const container = new Container();
    container.bind(TOKENS.num).toConstant(someValue);
    container.bind(TOKENS.some).toInstance(Some).inTransientScope();

    const instance = container.get(TOKENS.some);

    expect(instance.num).toBe(someValue);
  });

  it('injects a dependency by conditions from the parent container', () => {
    const defaultValue = 1;
    const someValue = 2;
    const anotherValue = 3;

    class Some {
      constructor(public value: number) {}
    }
    class Another {
      constructor(public value: number) {}
    }

    const TOKENS = {
      value: token<number>('value'),
      someClass: token<Some>('someClass'),
      anotherClass: token<Another>('anotherClass'),
    };

    const TAGS = {
      some: tag('some'),
    };

    injected(Some, TOKENS.value);
    tagged(Some, TAGS.some);

    injected(Another, TOKENS.value);

    const parentContainer = new Container();

    parentContainer.bind(TOKENS.value).toConstant(defaultValue);
    parentContainer.when(TAGS.some).bind(TOKENS.value).toConstant(someValue);
    parentContainer.when(Another).bind(TOKENS.value).toConstant(anotherValue);

    const childContainer = new Container().extend(parentContainer);
    childContainer.bind(TOKENS.someClass).toInstance(Some).inTransientScope();
    childContainer
      .bind(TOKENS.anotherClass)
      .toInstance(Another)
      .inTransientScope();

    const someInstance = childContainer.get(TOKENS.someClass);
    const anotherInstance = childContainer.get(TOKENS.anotherClass);

    expect(someInstance.value).toBe(someValue);
    expect(anotherInstance.value).toBe(anotherValue);
  });

  it('takes a binding by the tag assigned first with multiple related tags on the target', () => {
    const spy = jest.spyOn(console, 'warn').mockImplementation(() => null);

    const someValue = 1;
    const anotherValue = 2;
    const otherValue = 3;

    class Some {
      constructor(public value: number) {}
    }

    const TOKENS = {
      someValue: token<number>('someValue'),
      someClass: token<Some>('someClass'),
    };

    const TAGS = {
      some: tag('some'),
      another: tag('another'),
      other: tag('other'),
    };

    injected(Some, TOKENS.someValue);
    tagged(Some, TAGS.some, TAGS.another, TAGS.other);

    const container = new Container();

    container.when(TAGS.other).bind(TOKENS.someValue).toConstant(otherValue);
    container.when(TAGS.some).bind(TOKENS.someValue).toConstant(someValue);
    container
      .when(TAGS.another)
      .bind(TOKENS.someValue)
      .toConstant(anotherValue);

    container.bind(TOKENS.someClass).toInstance(Some).inTransientScope();

    const instance = container.get(TOKENS.someClass);

    expect(instance.value).toBe(someValue);

    spy.mockRestore();
  });

  it('logs a warning when multiple related tags are on the target', () => {
    const spy = jest.spyOn(console, 'warn').mockImplementation(() => null);

    class Some {
      constructor(public value: number) {}
    }

    const TOKENS = {
      someValue: token<number>('someValue'),
      someClass: token<Some>('someClass'),
    };

    const TAGS = {
      some: tag('some'),
      another: tag('another'),
    };

    injected(Some, TOKENS.someValue);
    tagged(Some, TAGS.some, TAGS.another);

    const container = new Container();

    container.when(TAGS.another).bind(TOKENS.someValue).toConstant(0);
    container.when(TAGS.some).bind(TOKENS.someValue).toConstant(0);

    container.bind(TOKENS.someClass).toInstance(Some).inTransientScope();

    container.get(TOKENS.someClass);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0]?.[0]).toMatchSnapshot();

    spy.mockRestore();
  });

  it('does not log a warning when a single related tag are on the target', () => {
    const spy = jest.spyOn(console, 'warn').mockImplementation(() => null);

    class Some {
      constructor(public value: number) {}
    }

    class Another {
      constructor(public value: number) {}
    }

    const TOKENS = {
      someValue: token<number>('someValue'),
      someClass: token<Some>('someClass'),
      anotherClass: token<Another>('anotherClass'),
    };

    const TAGS = {
      some: tag('some'),
    };

    injected(Some, TOKENS.someValue);
    injected(Another, TOKENS.someValue);

    tagged(Another, TAGS.some);

    const container = new Container();

    container.bind(TOKENS.someValue).toConstant(0);
    container.when(TAGS.some).bind(TOKENS.someValue).toConstant(0);

    container.bind(TOKENS.someClass).toInstance(Some).inTransientScope();
    container.bind(TOKENS.anotherClass).toInstance(Another).inTransientScope();

    container.get(TOKENS.someClass);
    container.get(TOKENS.anotherClass);

    expect(spy).toHaveBeenCalledTimes(0);

    spy.mockRestore();
  });

  it("skips the logging in 'production' env", () => {
    const restoreEnv = setEnv('production');
    const spy = jest.spyOn(console, 'warn').mockImplementation(() => null);

    class Some {
      constructor(public value: number) {}
    }

    const TOKENS = {
      someValue: token<number>('someValue'),
      someClass: token<Some>('someClass'),
    };

    const TAGS = {
      some: tag('some'),
      another: tag('another'),
    };

    injected(Some, TOKENS.someValue);
    tagged(Some, TAGS.some, TAGS.another);

    const container = new Container();

    container.when(TAGS.another).bind(TOKENS.someValue).toConstant(0);
    container.when(TAGS.some).bind(TOKENS.someValue).toConstant(0);

    container.bind(TOKENS.someClass).toInstance(Some).inTransientScope();

    container.get(TOKENS.someClass);

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

      class Some {
        constructor(public value: number) {}
      }

      const TOKENS = {
        someValue: token<number>('someValue'),
      };

      const TAGS = {
        some: tag('some'),
      };

      injected(Some, TOKENS.someValue);

      const container = new Container();

      container.bind(TOKENS.someValue).toConstant(someValue);
      container.when(TAGS.some).bind(TOKENS.someValue).toConstant(anotherValue);
      container.when(Some).bind(TOKENS.someValue).toConstant(otherValue);

      expect(container.get(TOKENS.someValue)).toBe(someValue);
      expect(container.get(TOKENS.someValue, [])).toBe(someValue);
      expect(container.get(TOKENS.someValue, [TAGS.some])).toBe(anotherValue);
      expect(container.get(TOKENS.someValue, [Some])).toBe(otherValue);
      expect(container.get(TOKENS.someValue, [TAGS.some, Some])).toBe(
        anotherValue,
      );
      expect(container.get(TOKENS.someValue, [Some, TAGS.some])).toBe(
        otherValue,
      );

      spy.mockRestore();
    });

    it('logs a warning when multiple related conditions were passed', () => {
      const spy = jest.spyOn(console, 'warn').mockImplementation(() => null);

      class Some {
        constructor(public value: number) {}
      }

      const TOKENS = {
        someValue: token<number>('someValue'),
      };

      const TAGS = {
        some: tag('some'),
      };

      injected(Some, TOKENS.someValue);

      const container = new Container();

      container.bind(TOKENS.someValue).toConstant(0);
      container.when(TAGS.some).bind(TOKENS.someValue).toConstant(0);
      container.when(Some).bind(TOKENS.someValue).toConstant(0);

      container.get(TOKENS.someValue, [Some, TAGS.some]);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy.mock.calls[0]?.[0]).toMatchSnapshot();

      spy.mockRestore();
    });

    it('does not log a warning when a single related condition were passed', () => {
      const spy = jest.spyOn(console, 'warn').mockImplementation(() => null);

      class Some {
        constructor(public value: number) {}
      }

      const TOKENS = {
        value: token<number>('value'),
      };

      const TAGS = {
        some: tag('some'),
      };

      injected(Some, TOKENS.value);

      const container = new Container();

      container.bind(TOKENS.value).toConstant(0);
      container.when(TAGS.some).bind(TOKENS.value).toConstant(0);
      container.when(Some).bind(TOKENS.value).toConstant(0);

      container.get(TOKENS.value, [Some]);
      container.get(TOKENS.value, [TAGS.some]);

      expect(spy).toHaveBeenCalledTimes(0);

      spy.mockRestore();
    });

    it("skips the logging in 'production' env", () => {
      const restoreEnv = setEnv('production');
      const spy = jest.spyOn(console, 'warn').mockImplementation(() => null);

      class Some {
        constructor(public value: number) {}
      }

      const TOKENS = {
        value: token<number>('value'),
      };

      const TAGS = {
        some: tag('some'),
      };

      injected(Some, TOKENS.value);

      const container = new Container();

      container.bind(TOKENS.value).toConstant(0);
      container.when(TAGS.some).bind(TOKENS.value).toConstant(0);
      container.when(Some).bind(TOKENS.value).toConstant(0);

      container.get(TOKENS.value, [Some, TAGS.some]);

      expect(spy).toHaveBeenCalledTimes(0);

      restoreEnv();
      spy.mockRestore();
    });
  });
});
