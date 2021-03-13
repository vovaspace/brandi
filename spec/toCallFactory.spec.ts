/* eslint-disable no-param-reassign */

import { Container, Factory, injected, token } from '../src';

describe('toCallFactory', () => {
  it('creates a call factory without arguments', () => {
    interface SomeResult {
      some: true;
    }

    const tokens = {
      someResultFactory: token<Factory<SomeResult>>('someResultFactory'),
    };

    const container = new Container();
    container
      .bind(tokens.someResultFactory)
      .toCallFactory(() => ({ some: true }));

    const factory = container.get(tokens.someResultFactory);
    const firstResult = factory();
    const secondResult = factory();

    expect(firstResult).toStrictEqual<SomeResult>({ some: true });
    expect(secondResult).toStrictEqual<SomeResult>({ some: true });
    expect(firstResult).not.toBe(secondResult);
  });

  it('creates a call factory without arguments but with a initializer that returns void', () => {
    interface SomeResult {
      num: number;
    }

    const tokens = {
      someResultFactory: token<Factory<SomeResult>>('someResultFactory'),
    };

    const container = new Container();

    container.bind(tokens.someResultFactory).toCallFactory(
      () => ({ num: 1 }),
      (result) => {
        result.num += 1;
      },
    );

    const factory = container.get(tokens.someResultFactory);
    const result = factory();

    expect(result).toStrictEqual<SomeResult>({ num: 2 });
  });

  it('creates a call factory without arguments but with a initializer that returns a value and ignores the returned value', () => {
    interface SomeResult {
      num: number;
    }

    const tokens = {
      someResultFactory: token<Factory<SomeResult>>('someResultFactory'),
    };

    const container = new Container();

    container.bind(tokens.someResultFactory).toCallFactory(
      () => ({ num: 1 }),
      (result) => {
        result.num += 1;
        return 1;
      },
    );

    const factory = container.get(tokens.someResultFactory);
    const result = factory();

    expect(result).toStrictEqual<SomeResult>({ num: 2 });
  });

  it('creates a call factory with arguments', () => {
    interface SomeResult {
      str: string;
      num: number;
    }

    const tokens = {
      someResultFactory: token<Factory<SomeResult, [str: string, num: number]>>(
        'someResultFactory',
      ),
    };

    const container = new Container();

    container.bind(tokens.someResultFactory).toCallFactory(
      () => ({ num: 0, str: '' }),
      (result, str, num) => {
        result.str = str;
        result.num = num;
      },
    );

    const str = '1';
    const num = 1;

    const factory = container.get(tokens.someResultFactory);
    const result = factory(str, num);

    expect(result).toStrictEqual<SomeResult>({ str, num });
  });

  it('creates a call factory which injects dependencies', () => {
    interface FirstResult {
      value: boolean;
    }

    interface SecondResult {
      first: FirstResult;
    }

    const tokens = {
      firstResult: token<FirstResult>('FirstResult'),
      secondResultFactory: token<Factory<SecondResult>>('secondResultFactory'),
    };

    const createFirst = (): FirstResult => ({ value: true });
    const createSecond = (first: FirstResult): SecondResult => ({ first });

    injected(createSecond, tokens.firstResult);

    const container = new Container();
    container.bind(tokens.firstResult).toCall(createFirst).inTransientScope();
    container.bind(tokens.secondResultFactory).toCallFactory(createSecond);

    const secondResultFactory = container.get(tokens.secondResultFactory);
    const secondResult = secondResultFactory();

    expect(secondResult).toStrictEqual<SecondResult>({
      first: { value: true },
    });
  });

  it('creates a call factory which gets an injection from parent container', () => {
    interface FirstResult {
      value: boolean;
    }

    interface SecondResult {
      first: FirstResult;
    }

    const tokens = {
      firstResult: token<FirstResult>('FirstResult'),
      secondResultFactory: token<Factory<SecondResult>>('secondResultFactory'),
    };

    const createFirst = () => ({ value: true });
    const createSecond = (first: FirstResult) => ({ first });

    injected(createSecond, tokens.firstResult);

    const parentContainer = new Container();
    parentContainer
      .bind(tokens.firstResult)
      .toCall(createFirst)
      .inTransientScope();

    const childContainer = new Container(parentContainer);
    childContainer.bind(tokens.secondResultFactory).toCallFactory(createSecond);

    const secondResultFactory = childContainer.get(tokens.secondResultFactory);
    const secondResult = secondResultFactory();

    expect(secondResult).toStrictEqual<SecondResult>({
      first: { value: true },
    });
  });

  it('creates a call factory which gets an injection from the container from which the factory was got', () => {
    interface FirstResult {
      value: true;
    }

    interface AnotherFirstResult {
      value: false;
    }

    interface SecondResult {
      first: { value: boolean };
    }

    const tokens = {
      firstResult: token<{ value: boolean }>('FirstResult'),
      secondResultFactory: token<Factory<SecondResult>>('secondResultFactory'),
    };

    const createSecond = (first: { value: boolean }): SecondResult => ({
      first,
    });

    injected(createSecond, tokens.firstResult);

    const parentContainer = new Container();
    parentContainer
      .bind(tokens.firstResult)
      .toCall((): FirstResult => ({ value: true }))
      .inTransientScope();
    parentContainer
      .bind(tokens.secondResultFactory)
      .toCallFactory(createSecond);

    const childContainer = new Container(parentContainer);
    childContainer
      .bind(tokens.firstResult)
      .toCall((): AnotherFirstResult => ({ value: false }))
      .inTransientScope();

    const parentContainerSecondResultFactory = parentContainer.get(
      tokens.secondResultFactory,
    );
    const childContainerSecondResultFactory = childContainer.get(
      tokens.secondResultFactory,
    );

    const parentContainerSecondResult = parentContainerSecondResultFactory();
    const childContainerSecondResult = childContainerSecondResultFactory();

    expect(parentContainerSecondResult.first).toStrictEqual<FirstResult>({
      value: true,
    });
    expect(childContainerSecondResult.first).toStrictEqual<AnotherFirstResult>({
      value: false,
    });
  });
});
