import { Container, Factory, injected, token } from '../src';

describe('toFactory', () => {
  it('creates a factory without arguments', () => {
    class SomeClass {}

    const tokens = {
      someClassFactory: token<Factory<SomeClass>>('someClassFactory'),
    };

    const container = new Container();
    container.bind(tokens.someClassFactory).toFactory(SomeClass);

    const factory = container.get(tokens.someClassFactory);
    const firstInstance = factory();
    const secondInstance = factory();

    expect(firstInstance).toBeInstanceOf(SomeClass);
    expect(secondInstance).toBeInstanceOf(SomeClass);
    expect(firstInstance).not.toBe(secondInstance);
  });

  it('creates a factory without arguments but with a transformer that returns void', () => {
    class SomeClass {
      public num: number = 0;

      public init() {
        this.num += 1;
      }
    }

    const tokens = {
      someClassFactory: token<Factory<SomeClass>>('someClassFactory'),
    };

    const container = new Container();

    container
      .bind(tokens.someClassFactory)
      .toFactory(SomeClass, (instance) => instance.init());

    const factory = container.get(tokens.someClassFactory);
    const instance = factory();

    expect(instance).toBeInstanceOf(SomeClass);
    expect(instance.num).toBe(1);
  });

  it('creates a factory without arguments but with a transformer that returns a value and ignores the returned value', () => {
    class SomeClass {
      public num: number = 0;

      public init() {
        this.num += 1;
      }
    }

    const tokens = {
      someClassFactory: token<Factory<SomeClass>>('someClassFactory'),
    };

    const container = new Container();

    container.bind(tokens.someClassFactory).toFactory(SomeClass, (instance) => {
      instance.init();
      return 1;
    });

    const factory = container.get(tokens.someClassFactory);
    const instance = factory();

    expect(instance).toBeInstanceOf(SomeClass);
    expect(instance.num).toBe(1);
  });

  it('creates a factory with arguments', () => {
    class SomeClass {
      public str: string = '';

      public num: number = 0;

      public init(str: string, num: number) {
        this.str = str;
        this.num = num;
      }
    }

    const tokens = {
      someClassFactory: token<Factory<SomeClass, [str: string, num: number]>>(
        'someClassFactory',
      ),
    };

    const container = new Container();

    container
      .bind(tokens.someClassFactory)
      .toFactory(SomeClass, (instance, str, num) => instance.init(str, num));

    const str = '1';
    const num = 1;

    const factory = container.get(tokens.someClassFactory);
    const instance = factory(str, num);

    expect(instance).toBeInstanceOf(SomeClass);
    expect(instance.str).toBe(str);
    expect(instance.num).toBe(num);
  });

  it('creates a factory which injects dependencies', () => {
    class FirstClass {}

    class SecondClass {
      constructor(public first: FirstClass) {}
    }

    const tokens = {
      firstClass: token<FirstClass>('FirstClass'),
      secondClassFactory: token<Factory<SecondClass>>('secondClassFactory'),
    };

    injected(SecondClass, tokens.firstClass);

    const container = new Container();
    container.bind(tokens.firstClass).toInstance(FirstClass).inTransientScope();
    container.bind(tokens.secondClassFactory).toFactory(SecondClass);

    const secondClassFactory = container.get(tokens.secondClassFactory);
    const secondClassInstance = secondClassFactory();

    expect(secondClassInstance).toBeInstanceOf(SecondClass);
    expect(secondClassInstance.first).toBeInstanceOf(FirstClass);
  });

  it('creates a factory which gets an injection from parent container', () => {
    class FirstClass {}

    class SecondClass {
      constructor(public first: FirstClass) {}
    }

    const tokens = {
      firstClass: token<FirstClass>('FirstClass'),
      secondClassFactory: token<Factory<SecondClass>>('secondClassFactory'),
    };

    injected(SecondClass, tokens.firstClass);

    const parentContainer = new Container();
    parentContainer
      .bind(tokens.firstClass)
      .toInstance(FirstClass)
      .inTransientScope();

    const childContainer = new Container(parentContainer);
    childContainer.bind(tokens.secondClassFactory).toFactory(SecondClass);

    const secondClassFactory = childContainer.get(tokens.secondClassFactory);
    const secondClassInstance = secondClassFactory();

    expect(secondClassInstance).toBeInstanceOf(SecondClass);
    expect(secondClassInstance.first).toBeInstanceOf(FirstClass);
  });

  it('creates a factory which gets an injection from the container from which the factory was got', () => {
    class FirstClass {}
    class AnotherFirstClass {}

    class SecondClass {
      constructor(public first: FirstClass) {}
    }

    const tokens = {
      firstClass: token<FirstClass>('FirstClass'),
      secondClassFactory: token<Factory<SecondClass>>('secondClassFactory'),
    };

    injected(SecondClass, tokens.firstClass);

    const parentContainer = new Container();
    parentContainer
      .bind(tokens.firstClass)
      .toInstance(FirstClass)
      .inTransientScope();
    parentContainer.bind(tokens.secondClassFactory).toFactory(SecondClass);

    const childContainer = new Container(parentContainer);
    childContainer
      .bind(tokens.firstClass)
      .toInstance(AnotherFirstClass)
      .inTransientScope();

    const parentContainerSecondClassFactory = parentContainer.get(
      tokens.secondClassFactory,
    );
    const childContainerSecondClassFactory = childContainer.get(
      tokens.secondClassFactory,
    );

    const parentContainerSecondClassInstance = parentContainerSecondClassFactory();
    const childContainerSecondClassInstance = childContainerSecondClassFactory();

    expect(parentContainerSecondClassInstance).toBeInstanceOf(SecondClass);
    expect(childContainerSecondClassInstance).toBeInstanceOf(SecondClass);

    expect(parentContainerSecondClassInstance.first).toBeInstanceOf(FirstClass);
    expect(childContainerSecondClassInstance.first).toBeInstanceOf(
      AnotherFirstClass,
    );
  });
});
