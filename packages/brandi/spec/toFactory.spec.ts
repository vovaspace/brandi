import { Container, Factory, injected, token } from '../src';

describe('toFactory', () => {
  it('creates an factory without arguments', () => {
    class Some {}

    const createSome = (): Some => ({});

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

    expect(firstCallInstance).not.toBeInstanceOf(Some);
    expect(secondCallInstance).not.toBeInstanceOf(Some);
    expect(firstCallInstance).toStrictEqual<Some>({});
    expect(secondCallInstance).toStrictEqual<Some>({});
    expect(firstCallInstance).not.toBe(secondCallInstance);
  });

  it('creates an factory without arguments but with a initializer that returns void', () => {
    class Some {
      public num: number = 0;

      public init(): void {
        this.num += 1;
      }
    }

    const createSome = (): Some => {
      const instance = {
        num: 0,
        init: (): void => {
          instance.num += 1;
        },
      };
      return instance;
    };

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

    expect(callInstance).not.toBeInstanceOf(Some);
    expect(callInstance.num).toBe(1);
  });

  it('creates an factory without arguments but with a initializer that returns a value and ignores the returned value', () => {
    class Some {
      public num: number = 0;

      public init(): void {
        this.num += 1;
      }
    }

    const createSome = (): Some => {
      const instance = {
        num: 0,
        init: (): void => {
          instance.num += 1;
        },
      };
      return instance;
    };

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

    expect(callInstance).not.toBeInstanceOf(Some);
    expect(callInstance.num).toBe(1);
  });

  it('creates an factory with arguments', () => {
    class Some {
      public str: string = '';

      public num: number = 0;

      public init(str: string, num: number): void {
        this.str = str;
        this.num = num;
      }
    }

    const createSome = (): Some => {
      const instance = {
        str: '',
        num: 0,
        init: (str: string, num: number): void => {
          instance.str = str;
          instance.num = num;
        },
      };
      return instance;
    };

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

    expect(callInstance).not.toBeInstanceOf(Some);
    expect(callInstance.str).toBe(str);
    expect(callInstance.num).toBe(num);
  });

  it('creates an factory which injects dependencies', () => {
    class Dependency {}

    class Some {
      constructor(public dependency: Dependency) {}
    }

    const createSome = (dependency: Dependency) => ({ dependency });

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

    expect(callInstance).not.toBeInstanceOf(Some);
    expect(callInstance.dependency).toBeInstanceOf(Dependency);
  });

  it('creates an factory which gets an injection from parent container', () => {
    class Dependency {}

    class Some {
      constructor(public dependency: Dependency) {}
    }

    const createSome = (dependency: Dependency) => ({ dependency });

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

    const childContainer = new Container(parentContainer);
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

    expect(callInstance).not.toBeInstanceOf(Some);
    expect(callInstance.dependency).toBeInstanceOf(Dependency);
  });

  it('creates an factory which gets an injection from the container from which the factory was got', () => {
    class Dependency {}
    class AnotherDependency {}

    class Some {
      constructor(public dependency: Dependency) {}
    }

    const createSome = (dependency: Dependency) => ({ dependency });

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

    const childContainer = new Container(parentContainer);
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
    expect(parentCallInstance).not.toBeInstanceOf(Some);
    expect(childConstructorInstance).toBeInstanceOf(Some);
    expect(childCallInstance).not.toBeInstanceOf(Some);

    expect(parentConstructorInstance.dependency).toBeInstanceOf(Dependency);
    expect(parentCallInstance.dependency).toBeInstanceOf(Dependency);
    expect(childConstructorInstance.dependency).toBeInstanceOf(
      AnotherDependency,
    );
    expect(childCallInstance.dependency).toBeInstanceOf(AnotherDependency);
  });
});
