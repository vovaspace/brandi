import { AsyncFactory, Container, Factory, injected, token } from '../src';

import { wait } from './utils';

describe('toFactory', () => {
  it('creates a factory without arguments', () => {
    class Some {}

    const createSome = (): Some => new Some();

    const TOKENS = {
      someConstructorFactory: token<Factory<Some>>('ConstructorFactory<Some>'),
      someCallFactory: token<Factory<Some>>('CallFactory<Some>'),
    };

    const container = new Container();
    container.bind(TOKENS.someConstructorFactory).toFactory(Some);
    container.bind(TOKENS.someCallFactory).toFactory(createSome);

    const constructorFactory = container.get(TOKENS.someConstructorFactory);
    const callFactory = container.get(TOKENS.someCallFactory);

    const firstConstructorInstance = constructorFactory();
    const secondConstructorInstance = constructorFactory();
    const firstCallInstance = callFactory();
    const secondCallInstance = callFactory();

    expect(firstConstructorInstance).toBeInstanceOf(Some);
    expect(secondConstructorInstance).toBeInstanceOf(Some);
    expect(firstConstructorInstance).not.toBe(secondConstructorInstance);

    expect(firstCallInstance).toBeInstanceOf(Some);
    expect(secondCallInstance).toBeInstanceOf(Some);
    expect(firstCallInstance).not.toBe(secondCallInstance);
  });

  it('creates a factory without arguments but with a initializer that returns void', () => {
    class Some {
      public num: number = 0;

      public init(): void {
        this.num += 1;
      }
    }

    const createSome = (): Some => new Some();

    const TOKENS = {
      someConstructorFactory: token<Factory<Some>>('ConstructorFactory<Some>'),
      someCallFactory: token<Factory<Some>>('CallFactory<Some>'),
    };

    const container = new Container();
    container
      .bind(TOKENS.someConstructorFactory)
      .toFactory(Some, (instance) => instance.init());
    container
      .bind(TOKENS.someCallFactory)
      .toFactory(createSome, (instance) => instance.init());

    const constructorFactory = container.get(TOKENS.someConstructorFactory);
    const callFactory = container.get(TOKENS.someCallFactory);

    const constructorInstance = constructorFactory();
    const callInstance = callFactory();

    expect(constructorInstance).toBeInstanceOf(Some);
    expect(constructorInstance.num).toBe(1);

    expect(callInstance).toBeInstanceOf(Some);
    expect(callInstance.num).toBe(1);
  });

  it('creates a factory without arguments but with a initializer that returns a value and ignores the returned value', () => {
    class Some {
      public num: number = 0;

      public init(): void {
        this.num += 1;
      }
    }

    const createSome = (): Some => new Some();

    const TOKENS = {
      someConstructorFactory: token<Factory<Some>>('ConstructorFactory<Some>'),
      someCallFactory: token<Factory<Some>>('CallFactory<Some>'),
    };

    const container = new Container();
    container
      .bind(TOKENS.someConstructorFactory)
      .toFactory(Some, (instance) => {
        instance.init();
        return 1;
      });
    container.bind(TOKENS.someCallFactory).toFactory(createSome, (instance) => {
      instance.init();
      return 1;
    });

    const constructorFactory = container.get(TOKENS.someConstructorFactory);
    const callFactory = container.get(TOKENS.someCallFactory);

    const constructorInstance = constructorFactory();
    const callInstance = callFactory();

    expect(constructorInstance).toBeInstanceOf(Some);
    expect(constructorInstance.num).toBe(1);

    expect(callInstance).toBeInstanceOf(Some);
    expect(callInstance.num).toBe(1);
  });

  it('creates a factory with arguments', () => {
    class Some {
      public str: string = '';

      public num: number = 0;

      public init(str: string, num: number): void {
        this.str = str;
        this.num = num;
      }
    }

    const createSome = (): Some => new Some();

    const TOKENS = {
      someConstructorFactory: token<Factory<Some, [str: string, num: number]>>(
        'ConstructorFactory<Some>',
      ),
      someCallFactory: token<Factory<Some, [str: string, num: number]>>(
        'CallFactory<Some>',
      ),
    };

    const container = new Container();
    container
      .bind(TOKENS.someConstructorFactory)
      .toFactory(Some, (instance, str, num) => instance.init(str, num));
    container
      .bind(TOKENS.someCallFactory)
      .toFactory(createSome, (instance, str, num) => instance.init(str, num));

    const str = '1';
    const num = 1;

    const constructorFactory = container.get(TOKENS.someConstructorFactory);
    const callFactory = container.get(TOKENS.someCallFactory);

    const constructorInstance = constructorFactory(str, num);
    const callInstance = callFactory(str, num);

    expect(constructorInstance).toBeInstanceOf(Some);
    expect(constructorInstance.str).toBe(str);
    expect(constructorInstance.num).toBe(num);

    expect(callInstance).toBeInstanceOf(Some);
    expect(callInstance.str).toBe(str);
    expect(callInstance.num).toBe(num);
  });

  it('creates a factory which injects dependencies', () => {
    class Dependency {}

    class Some {
      constructor(public dependency: Dependency) {}
    }

    const createSome = (dependency: Dependency) => new Some(dependency);

    const TOKENS = {
      dependency: token<Dependency>('FirstClass'),
      someConstructorFactory: token<Factory<Some>>('ConstructorFactory<Some>'),
      someCallFactory: token<Factory<Some>>('CallFactory<Some>'),
    };

    injected(Some, TOKENS.dependency);
    injected(createSome, TOKENS.dependency);

    const container = new Container();
    container.bind(TOKENS.dependency).toInstance(Dependency).inTransientScope();
    container.bind(TOKENS.someConstructorFactory).toFactory(Some);
    container.bind(TOKENS.someCallFactory).toFactory(createSome);

    const constructorFactory = container.get(TOKENS.someConstructorFactory);
    const callFactory = container.get(TOKENS.someCallFactory);

    const constructorInstance = constructorFactory();
    const callInstance = callFactory();

    expect(constructorInstance).toBeInstanceOf(Some);
    expect(constructorInstance.dependency).toBeInstanceOf(Dependency);

    expect(callInstance).toBeInstanceOf(Some);
    expect(callInstance.dependency).toBeInstanceOf(Dependency);
  });

  it('creates a factory which gets an injection from parent container', () => {
    class Dependency {}

    class Some {
      constructor(public dependency: Dependency) {}
    }

    const createSome = (dependency: Dependency) => new Some(dependency);

    const TOKENS = {
      dependency: token<Dependency>('FirstClass'),
      someConstructorFactory: token<Factory<Some>>('ConstructorFactory<Some>'),
      someCallFactory: token<Factory<Some>>('CallFactory<Some>'),
    };

    injected(Some, TOKENS.dependency);
    injected(createSome, TOKENS.dependency);

    const parentContainer = new Container();
    parentContainer
      .bind(TOKENS.dependency)
      .toInstance(Dependency)
      .inTransientScope();

    const childContainer = new Container().extend(parentContainer);
    childContainer.bind(TOKENS.someConstructorFactory).toFactory(Some);
    childContainer.bind(TOKENS.someCallFactory).toFactory(createSome);

    const constructorFactory = childContainer.get(
      TOKENS.someConstructorFactory,
    );
    const callFactory = childContainer.get(TOKENS.someCallFactory);

    const constructorInstance = constructorFactory();
    const callInstance = callFactory();

    expect(constructorInstance).toBeInstanceOf(Some);
    expect(constructorInstance.dependency).toBeInstanceOf(Dependency);

    expect(callInstance).toBeInstanceOf(Some);
    expect(callInstance.dependency).toBeInstanceOf(Dependency);
  });

  it('creates a factory which gets an injection from the container from which the factory was got', () => {
    class Dependency {}
    class AnotherDependency {}

    class Some {
      constructor(public dependency: Dependency) {}
    }

    const createSome = (dependency: Dependency) => new Some(dependency);

    const TOKENS = {
      dependency: token<Dependency>('FirstClass'),
      someConstructorFactory: token<Factory<Some>>('ConstructorFactory<Some>'),
      someCallFactory: token<Factory<Some>>('CallFactory<Some>'),
    };

    injected(Some, TOKENS.dependency);
    injected(createSome, TOKENS.dependency);

    const parentContainer = new Container();
    parentContainer
      .bind(TOKENS.dependency)
      .toInstance(Dependency)
      .inTransientScope();
    parentContainer.bind(TOKENS.someConstructorFactory).toFactory(Some);
    parentContainer.bind(TOKENS.someCallFactory).toFactory(createSome);

    const childContainer = new Container().extend(parentContainer);
    childContainer
      .bind(TOKENS.dependency)
      .toInstance(AnotherDependency)
      .inTransientScope();

    const parentContainerConstructorFactory = parentContainer.get(
      TOKENS.someConstructorFactory,
    );
    const parentContainerCallFactory = parentContainer.get(
      TOKENS.someCallFactory,
    );
    const childContainerConstructorFactory = childContainer.get(
      TOKENS.someConstructorFactory,
    );
    const childContainerCallFactory = childContainer.get(
      TOKENS.someCallFactory,
    );

    const parentConstructorInstance = parentContainerConstructorFactory();
    const parentCallInstance = parentContainerCallFactory();
    const childConstructorInstance = childContainerConstructorFactory();
    const childCallInstance = childContainerCallFactory();

    expect(parentConstructorInstance).toBeInstanceOf(Some);
    expect(parentCallInstance).toBeInstanceOf(Some);
    expect(childConstructorInstance).toBeInstanceOf(Some);
    expect(childCallInstance).toBeInstanceOf(Some);

    expect(parentConstructorInstance.dependency).toBeInstanceOf(Dependency);
    expect(parentCallInstance.dependency).toBeInstanceOf(Dependency);
    expect(childConstructorInstance.dependency).toBeInstanceOf(
      AnotherDependency,
    );
    expect(childCallInstance.dependency).toBeInstanceOf(AnotherDependency);
  });

  it('creates an instance caching factory', () => {
    class Some {}

    const TOKENS = {
      some: token<Some>('some'),
      someFactory: token<Factory<Some>>('Factory<Some>'),
    };

    const container = new Container();
    container.bind(TOKENS.some).toInstance(Some).inSingletonScope();
    container
      .bind(TOKENS.someFactory)
      .toFactory(() => container.get(TOKENS.some));

    const factory = container.get(TOKENS.someFactory);

    const firstInstance = factory();
    const secondInstance = factory();

    expect(firstInstance).toBeInstanceOf(Some);
    expect(secondInstance).toBeInstanceOf(Some);
    expect(firstInstance).toBe(secondInstance);
  });

  it('creates a factory with an async creator', async () => {
    expect.assertions(2);

    class Some {}

    const createSome = (): Promise<Some> => wait(() => new Some());

    const TOKENS = {
      someAsyncFactory: token<AsyncFactory<Some>>('AsyncFactory<Some>'),
    };

    const container = new Container();
    container.bind(TOKENS.someAsyncFactory).toFactory(createSome);

    const factory = container.get(TOKENS.someAsyncFactory);
    const creation = factory();
    const instance = await creation;

    expect(creation).toBeInstanceOf(Promise);
    expect(instance).toBeInstanceOf(Some);
  });

  it('creates a factory with an async creator and a sync initializer', async () => {
    expect.assertions(6);

    class Some {
      public num: number = 0;

      public init(): void {
        this.num += 1;
      }
    }

    class Another {
      public num: number = 0;

      public init(num: number): void {
        this.num = num;
      }
    }

    const createSome = (): Promise<Some> => wait(() => new Some());
    const createAnother = (): Promise<Another> => wait(() => new Another());

    const TOKENS = {
      someAsyncFactory: token<AsyncFactory<Some>>('AsyncFactory<Some>'),
      anotherAsyncFactory: token<AsyncFactory<Another, [num: number]>>(
        'AsyncFactory<Another>',
      ),
    };

    const container = new Container();
    container
      .bind(TOKENS.someAsyncFactory)
      .toFactory(createSome, (instance) => instance.init());
    container
      .bind(TOKENS.anotherAsyncFactory)
      .toFactory(createAnother, (instance, num) => instance.init(num));

    const someFactory = container.get(TOKENS.someAsyncFactory);
    const anotherFactory = container.get(TOKENS.anotherAsyncFactory);

    const someCreation = someFactory();
    const anotherCreation = anotherFactory(2);

    const someInstance = await someCreation;
    const anotherInstance = await anotherCreation;

    expect(someCreation).toBeInstanceOf(Promise);
    expect(anotherCreation).toBeInstanceOf(Promise);
    expect(someInstance).toBeInstanceOf(Some);
    expect(anotherInstance).toBeInstanceOf(Another);
    expect(someInstance.num).toBe(1);
    expect(anotherInstance.num).toBe(2);
  });

  it('creates a factory with a sync creator and an async initializer', async () => {
    expect.assertions(6);

    class Some {
      public num: number = 0;

      public init(): Promise<void> {
        return wait(() => {
          this.num += 1;
        });
      }
    }

    class Another {
      public num: number = 0;

      public init(num: number): Promise<void> {
        return wait(() => {
          this.num = num;
        });
      }
    }

    const TOKENS = {
      someAsyncFactory: token<AsyncFactory<Some>>('AsyncFactory<Some>'),
      anotherAsyncFactory: token<AsyncFactory<Another, [num: number]>>(
        'AsyncFactory<Another>',
      ),
    };

    const container = new Container();
    container
      .bind(TOKENS.someAsyncFactory)
      .toFactory(Some, (instance) => instance.init());
    container
      .bind(TOKENS.anotherAsyncFactory)
      .toFactory(Another, (instance, num) => instance.init(num));

    const someFactory = container.get(TOKENS.someAsyncFactory);
    const anotherFactory = container.get(TOKENS.anotherAsyncFactory);

    const someCreation = someFactory();
    const anotherCreation = anotherFactory(2);

    const someInstance = await someCreation;
    const anotherInstance = await anotherCreation;

    expect(someCreation).toBeInstanceOf(Promise);
    expect(anotherCreation).toBeInstanceOf(Promise);
    expect(someInstance).toBeInstanceOf(Some);
    expect(anotherInstance).toBeInstanceOf(Another);
    expect(someInstance.num).toBe(1);
    expect(anotherInstance.num).toBe(2);
  });

  it('creates a factory with an async creator and an async initializer', async () => {
    expect.assertions(6);

    class Some {
      public num: number = 0;

      public init(): Promise<void> {
        return wait(() => {
          this.num += 1;
        });
      }
    }

    class Another {
      public num: number = 0;

      public init(num: number): Promise<void> {
        return wait(() => {
          this.num = num;
        });
      }
    }

    const createSome = (): Promise<Some> => wait(() => new Some());
    const createAnother = (): Promise<Another> => wait(() => new Another());

    const TOKENS = {
      someAsyncFactory: token<AsyncFactory<Some>>('AsyncFactory<Some>'),
      anotherAsyncFactory: token<AsyncFactory<Another, [num: number]>>(
        'AsyncFactory<Another>',
      ),
    };

    const container = new Container();
    container
      .bind(TOKENS.someAsyncFactory)
      .toFactory(createSome, (instance) => instance.init());
    container
      .bind(TOKENS.anotherAsyncFactory)
      .toFactory(createAnother, (instance, num) => instance.init(num));

    const someFactory = container.get(TOKENS.someAsyncFactory);
    const anotherFactory = container.get(TOKENS.anotherAsyncFactory);

    const someCreation = someFactory();
    const anotherCreation = anotherFactory(2);

    const someInstance = await someCreation;
    const anotherInstance = await anotherCreation;

    expect(someCreation).toBeInstanceOf(Promise);
    expect(anotherCreation).toBeInstanceOf(Promise);
    expect(someInstance).toBeInstanceOf(Some);
    expect(anotherInstance).toBeInstanceOf(Another);
    expect(someInstance.num).toBe(1);
    expect(anotherInstance.num).toBe(2);
  });

  describe('typings', () => {
    it('requires to bind the same type of dependency and token', () => {
      expect.assertions(0);

      class Some {
        public some = true;

        public num: number = 0;

        public init(num: number) {
          this.num = num;
        }
      }

      class Another {
        public another = true;

        public num: number = 0;

        public init(num: number) {
          this.num = num;
        }
      }

      const createAnother = (): Another => new Another();

      const TOKENS = {
        someFactory: token<Factory<Some>>('Factory<Some>'),
        someFactoryWithArgument: token<Factory<Some, [num: number]>>(
          'Factory<Some, [number]>',
        ),
      };

      const container = new Container();

      // @ts-expect-error: No overload matches this call.
      container.bind(TOKENS.someFactory).toFactory(Another);

      container
        .bind(TOKENS.someFactory)
        // @ts-expect-error: No overload matches this call.
        .toFactory(Another, (instance) => instance.init(1));

      // @ts-expect-error: No overload matches this call.
      container.bind(TOKENS.someFactory).toFactory(createAnother);

      container
        .bind(TOKENS.someFactory)
        // @ts-expect-error: No overload matches this call.
        .toFactory(createAnother, (instance) => instance.init(1));

      // @ts-expect-error: No overload matches this call.
      container.bind(TOKENS.someFactoryWithArgument).toFactory(Another);

      container
        .bind(TOKENS.someFactoryWithArgument)
        // @ts-expect-error: No overload matches this call.
        .toFactory(Another, (instance, num) => instance.init(num));

      // @ts-expect-error: No overload matches this call.
      container.bind(TOKENS.someFactoryWithArgument).toFactory(createAnother);

      container
        .bind(TOKENS.someFactoryWithArgument)
        // @ts-expect-error: No overload matches this call.
        .toFactory(createAnother, (instance, num) => instance.init(num));
    });

    it('does not allow passing arguments to a factory without arguments', () => {
      expect.assertions(0);

      class Some {}

      const TOKENS = {
        someFactory: token<Factory<Some>>('Factory<Some>'),
      };

      const container = new Container();

      // @ts-expect-error: No overload matches this call.
      container
        .bind(TOKENS.someFactory)
        // @ts-expect-error: Parameters 'instance' and 'num' implicitly have an 'any' type.
        .toFactory(Some, (instance, num) => ({ instance, num }));

      // @ts-expect-error: Expected 0 arguments, but got 1.
      container.get(TOKENS.someFactory)(2);
    });

    it('does not allow passing async creator or async initializer to sync factory binding', () => {
      expect.assertions(0);

      class Some {
        public some: boolean = true;
      }

      const createSomeAsync = async () => new Some();

      const TOKENS = {
        someFactory: token<Factory<Some>>('Factory<Some>'),
      };

      const container = new Container();

      // @ts-expect-error: No overload matches this call.
      container.bind(TOKENS.someFactory).toFactory(createSomeAsync);

      // @ts-expect-error: No overload matches this call.
      container.bind(TOKENS.someFactory).toFactory(Some, async () => {});

      container
        .bind(TOKENS.someFactory)
        // @ts-expect-error: No overload matches this call.
        .toFactory(createSomeAsync, async () => {});
    });
  });
});
