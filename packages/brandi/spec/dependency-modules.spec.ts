import {
  Container,
  DependencyModule,
  createDependencyModule,
  injected,
  tag,
  tagged,
  token,
} from '../src';

describe('dependency modules', () => {
  it('uses a binding from the dependency module', () => {
    const value = 1;

    const TOKENS = {
      value: token<number>('value'),
    };

    const dependencyModule = new DependencyModule();
    dependencyModule.bind(TOKENS.value).toConstant(value);

    const container = new Container();
    container.use(TOKENS.value).from(dependencyModule);

    expect(container.get(TOKENS.value)).toBe(value);
  });

  it('uses multiple bindings from the dependency module', () => {
    const num = 1;
    const str = '';

    const TOKENS = {
      num: token<number>('num'),
      str: token<string>('str'),
    };

    const dependencyModule = new DependencyModule();
    dependencyModule.bind(TOKENS.num).toConstant(num);
    dependencyModule.bind(TOKENS.str).toConstant(str);

    const container = new Container();
    container.use(TOKENS.num, TOKENS.str).from(dependencyModule);

    expect(container.get(TOKENS.num)).toBe(num);
    expect(container.get(TOKENS.str)).toBe(str);
  });

  it('uses a binding with dependencies from the dependency module', () => {
    const value = 1;

    class Some {
      constructor(public num: number) {}
    }

    const TOKENS = {
      num: token<number>('value'),
      some: token<Some>('some'),
    };

    injected(Some, TOKENS.num);

    const dependencyModule = new DependencyModule();
    dependencyModule.bind(TOKENS.num).toConstant(value);
    dependencyModule.bind(TOKENS.some).toInstance(Some).inTransientScope();

    const container = new Container();
    container.use(TOKENS.some).from(dependencyModule);

    const instance = container.get(TOKENS.some);

    expect(instance).toBeInstanceOf(Some);
    expect(instance.num).toBe(value);
  });

  it("ignores dependency module's binding if there is container's binding", () => {
    const moduleValue = 1;
    const containerValue = 1;

    class Some {
      constructor(public num: number) {}
    }

    const TOKENS = {
      num: token<number>('value'),
      some: token<Some>('some'),
    };

    injected(Some, TOKENS.num);

    const dependencyModule = new DependencyModule();
    dependencyModule.bind(TOKENS.num).toConstant(moduleValue);
    dependencyModule.bind(TOKENS.some).toInstance(Some).inTransientScope();

    const container = new Container();
    container.use(TOKENS.some).from(dependencyModule);
    container.bind(TOKENS.num).toConstant(containerValue);

    const instance = container.get(TOKENS.some);

    expect(instance).toBeInstanceOf(Some);
    expect(instance.num).toBe(containerValue);
  });

  it("ignores dependency module's binding if there is container parent's binding", () => {
    const moduleValue = 1;
    const containerValue = 1;

    class Some {
      constructor(public num: number) {}
    }

    const TOKENS = {
      num: token<number>('value'),
      some: token<Some>('some'),
    };

    injected(Some, TOKENS.num);

    const dependencyModule = new DependencyModule();
    dependencyModule.bind(TOKENS.num).toConstant(moduleValue);
    dependencyModule.bind(TOKENS.some).toInstance(Some).inTransientScope();

    const parentContainer = new Container();
    parentContainer.bind(TOKENS.num).toConstant(containerValue);

    const childContainer = new Container().extend(parentContainer);
    childContainer.use(TOKENS.some).from(dependencyModule);

    const instance = childContainer.get(TOKENS.some);

    expect(instance).toBeInstanceOf(Some);
    expect(instance.num).toBe(containerValue);
  });

  it('uses hierarchical dependency modules', () => {
    const value = 1;

    class SomeDependency {
      constructor(public num: number) {}
    }

    class AnotherDependency {
      constructor(public some: SomeDependency) {}
    }

    class Target {
      constructor(public another: AnotherDependency) {}
    }

    const TOKENS = {
      num: token<number>('num'),
      someDependency: token<SomeDependency>('someDependency'),
      anotherDependency: token<AnotherDependency>('anotherDependency'),
      target: token<Target>('target'),
    };

    injected(SomeDependency, TOKENS.num);
    injected(AnotherDependency, TOKENS.someDependency);
    injected(Target, TOKENS.anotherDependency);

    const someModule = new DependencyModule();
    someModule.bind(TOKENS.num).toConstant(value);
    someModule
      .bind(TOKENS.someDependency)
      .toInstance(SomeDependency)
      .inTransientScope();

    const anotherModule = new DependencyModule();
    anotherModule.use(TOKENS.someDependency).from(someModule);
    anotherModule
      .bind(TOKENS.anotherDependency)
      .toInstance(AnotherDependency)
      .inTransientScope();

    const container = new Container();
    container.use(TOKENS.anotherDependency).from(anotherModule);
    container.bind(TOKENS.target).toInstance(Target).inTransientScope();

    const instance = container.get(TOKENS.target);

    expect(instance.another).toBeInstanceOf(AnotherDependency);
    expect(instance.another.some).toBeInstanceOf(SomeDependency);
  });

  it("ignores dependency module's binding if there is a higher-level dependency module's binding", () => {
    const someValue = 1;
    const anotherValue = 2;

    class SomeDependency {
      constructor(public num: number) {}
    }

    class AnotherDependency {
      constructor(public some: SomeDependency) {}
    }

    class Target {
      constructor(
        public some: SomeDependency,
        public another: AnotherDependency,
      ) {}
    }

    const TOKENS = {
      num: token<number>('num'),
      someDependency: token<SomeDependency>('someDependency'),
      anotherDependency: token<AnotherDependency>('anotherDependency'),
      target: token<Target>('target'),
    };

    injected(SomeDependency, TOKENS.num);
    injected(AnotherDependency, TOKENS.someDependency);
    injected(Target, TOKENS.someDependency, TOKENS.anotherDependency);

    const someModule = new DependencyModule();
    someModule.bind(TOKENS.num).toConstant(someValue);
    someModule
      .bind(TOKENS.someDependency)
      .toInstance(SomeDependency)
      .inTransientScope();

    const anotherModule = new DependencyModule();
    anotherModule.use(TOKENS.someDependency).from(someModule);
    anotherModule.bind(TOKENS.num).toConstant(anotherValue);
    anotherModule
      .bind(TOKENS.anotherDependency)
      .toInstance(AnotherDependency)
      .inTransientScope();

    const container = new Container();
    container.use(TOKENS.someDependency).from(someModule);
    container.use(TOKENS.anotherDependency).from(anotherModule);
    container.bind(TOKENS.target).toInstance(Target).inTransientScope();

    const instance = container.get(TOKENS.target);

    expect(instance.some.num).toBe(someValue);
    expect(instance.another.some.num).toBe(anotherValue);
  });

  it('uses a dependency module by conditions', () => {
    class SomeDependency {}
    class AnotherDependency {}

    class Some {
      constructor(public dependency: SomeDependency) {}
    }

    class Another {
      constructor(public dependency: SomeDependency) {}
    }

    const TOKENS = {
      dependency: token<SomeDependency>('dependency'),
      some: token<Some>('some'),
      another: token<Another>('another'),
    };

    injected(Some, TOKENS.dependency);
    injected(Another, TOKENS.dependency);

    const someDependencyModule = new DependencyModule();
    someDependencyModule
      .bind(TOKENS.dependency)
      .toInstance(SomeDependency)
      .inTransientScope();

    const anotherDependencyModule = new DependencyModule();
    anotherDependencyModule
      .bind(TOKENS.dependency)
      .toInstance(AnotherDependency)
      .inTransientScope();

    const container = new Container();
    container.bind(TOKENS.some).toInstance(Some).inTransientScope();
    container.bind(TOKENS.another).toInstance(Another).inTransientScope();
    container.use(TOKENS.dependency).from(someDependencyModule);
    container
      .when(Another)
      .use(TOKENS.dependency)
      .from(anotherDependencyModule);

    const someInstance = container.get(TOKENS.some);
    const anotherInstance = container.get(TOKENS.another);

    expect(someInstance.dependency).toBeInstanceOf(SomeDependency);
    expect(anotherInstance.dependency).toBeInstanceOf(AnotherDependency);
  });

  it('gets a dependency from the dependency module by conditions', () => {
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
      another: tag('another'),
    };

    injected(Some, TOKENS.num);

    injected(Another, TOKENS.num);
    tagged(Another, TAGS.another);

    const dependencyModule = new DependencyModule();
    dependencyModule.bind(TOKENS.num).toConstant(someValue);
    dependencyModule
      .when(TAGS.another)
      .bind(TOKENS.num)
      .toConstant(anotherValue);

    const container = new Container();
    container.use(TOKENS.num).from(dependencyModule);
    container.bind(TOKENS.some).toInstance(Some).inTransientScope();
    container.bind(TOKENS.another).toInstance(Another).inTransientScope();

    const someInstance = container.get(TOKENS.some);
    const anotherInstance = container.get(TOKENS.another);

    expect(someInstance.num).toBe(someValue);
    expect(anotherInstance.num).toBe(anotherValue);
  });

  it('separates resolution chains', () => {
    const someValue = 1;
    const anotherValue = 2;

    class SomeDependency {
      constructor(public num: number) {}
    }
    class AnotherDependency {
      constructor(public num: number) {}
    }

    class Target {
      constructor(
        public some: SomeDependency,
        public another: AnotherDependency,
      ) {}
    }

    const TOKENS = {
      num: token<number>('num'),
      someDependency: token<SomeDependency>('someDependency'),
      anotherDependency: token<AnotherDependency>('anotherDependency'),
      target: token<Target>('target'),
    };

    injected(SomeDependency, TOKENS.num);
    injected(AnotherDependency, TOKENS.num);
    injected(Target, TOKENS.someDependency, TOKENS.anotherDependency);

    const someDependencyModule = new DependencyModule();
    someDependencyModule.bind(TOKENS.num).toConstant(someValue);
    someDependencyModule
      .bind(TOKENS.someDependency)
      .toInstance(SomeDependency)
      .inTransientScope();

    const anotherDependencyModule = new DependencyModule();
    anotherDependencyModule.bind(TOKENS.num).toConstant(anotherValue);
    anotherDependencyModule
      .bind(TOKENS.anotherDependency)
      .toInstance(AnotherDependency)
      .inTransientScope();

    const container = new Container();
    container.use(TOKENS.someDependency).from(someDependencyModule);
    container.use(TOKENS.anotherDependency).from(anotherDependencyModule);
    container.bind(TOKENS.target).toInstance(Target).inTransientScope();

    const instance = container.get(TOKENS.target);

    expect(instance.some).toBeInstanceOf(SomeDependency);
    expect(instance.another).toBeInstanceOf(AnotherDependency);
    expect(instance.some.num).toBe(someValue);
    expect(instance.another.num).toBe(anotherValue);
  });

  it('uses a container as dependency module', () => {
    const value = 1;

    const TOKENS = {
      value: token<number>('value'),
    };

    const containerAsModule = new Container();
    containerAsModule.bind(TOKENS.value).toConstant(value);

    const container = new Container();
    container.use(TOKENS.value).from(containerAsModule);

    expect(container.get(TOKENS.value)).toBe(value);
  });

  it('uses a container with parent as dependency module', () => {
    const value = 1;

    const TOKENS = {
      value: token<number>('value'),
    };

    const parentContainerAsModule = new Container();
    parentContainerAsModule.bind(TOKENS.value).toConstant(value);

    const childContainerAsModule = new Container().extend(
      parentContainerAsModule,
    );

    const container = new Container();
    container.use(TOKENS.value).from(childContainerAsModule);

    expect(container.get(TOKENS.value)).toBe(value);
  });

  it("creates a dependency module by 'createDependencyModule'", () => {
    expect(createDependencyModule()).toBeInstanceOf(DependencyModule);
  });
});
