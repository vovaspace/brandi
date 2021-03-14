/* eslint-disable no-param-reassign */

import { Container, Creator, injected, token } from '../src';

describe('toCreator', () => {
  it('creates a creator without arguments', () => {
    interface SomeEntity {
      some: true;
    }

    const tokens = {
      someEntityCreator: token<Creator<SomeEntity>>('someEntityCreator'),
    };

    const container = new Container();
    container.bind(tokens.someEntityCreator).toCreator(() => ({ some: true }));

    const creator = container.get(tokens.someEntityCreator);
    const firstEntity = creator();
    const secondEntity = creator();

    expect(firstEntity).toStrictEqual<SomeEntity>({ some: true });
    expect(secondEntity).toStrictEqual<SomeEntity>({ some: true });
    expect(firstEntity).not.toBe(secondEntity);
  });

  it('creates a creator without arguments but with a initializer that returns void', () => {
    interface SomeEntity {
      num: number;
    }

    const tokens = {
      someEntityCreator: token<Creator<SomeEntity>>('someEntityCreator'),
    };

    const container = new Container();

    container.bind(tokens.someEntityCreator).toCreator(
      () => ({ num: 1 }),
      (entity) => {
        entity.num += 1;
      },
    );

    const creator = container.get(tokens.someEntityCreator);
    const entity = creator();

    expect(entity).toStrictEqual<SomeEntity>({ num: 2 });
  });

  it('creates a creator without arguments but with a initializer that returns a value and ignores the returned value', () => {
    interface SomeEntity {
      num: number;
    }

    const tokens = {
      someEntityCreator: token<Creator<SomeEntity>>('someEntityCreator'),
    };

    const container = new Container();

    container.bind(tokens.someEntityCreator).toCreator(
      () => ({ num: 1 }),
      (entity) => {
        entity.num += 1;
        return 1;
      },
    );

    const creator = container.get(tokens.someEntityCreator);
    const entity = creator();

    expect(entity).toStrictEqual<SomeEntity>({ num: 2 });
  });

  it('creates a creator with arguments', () => {
    interface SomeEntity {
      str: string;
      num: number;
    }

    const tokens = {
      someEntityCreator: token<Creator<SomeEntity, [str: string, num: number]>>(
        'someEntityCreator',
      ),
    };

    const container = new Container();

    container.bind(tokens.someEntityCreator).toCreator(
      () => ({ num: 0, str: '' }),
      (entity, str, num) => {
        entity.str = str;
        entity.num = num;
      },
    );

    const str = '1';
    const num = 1;

    const creator = container.get(tokens.someEntityCreator);
    const entity = creator(str, num);

    expect(entity).toStrictEqual<SomeEntity>({ str, num });
  });

  it('creates a creator which injects dependencies', () => {
    interface FirstEntity {
      value: boolean;
    }

    interface SecondEntity {
      first: FirstEntity;
    }

    const tokens = {
      firstEntity: token<FirstEntity>('FirstEntity'),
      secondEntityCreator: token<Creator<SecondEntity>>('secondEntityCreator'),
    };

    const createFirst = (): FirstEntity => ({ value: true });
    const createSecond = (first: FirstEntity): SecondEntity => ({ first });

    injected(createSecond, tokens.firstEntity);

    const container = new Container();
    container.bind(tokens.firstEntity).toCall(createFirst).inTransientScope();
    container.bind(tokens.secondEntityCreator).toCreator(createSecond);

    const secondEntityCreator = container.get(tokens.secondEntityCreator);
    const secondEntity = secondEntityCreator();

    expect(secondEntity).toStrictEqual<SecondEntity>({
      first: { value: true },
    });
  });

  it('creates a creator which gets an injection from parent container', () => {
    interface FirstEntity {
      value: boolean;
    }

    interface SecondEntity {
      first: FirstEntity;
    }

    const tokens = {
      firstEntity: token<FirstEntity>('FirstEntity'),
      secondEntityCreator: token<Creator<SecondEntity>>('secondEntityCreator'),
    };

    const createFirst = () => ({ value: true });
    const createSecond = (first: FirstEntity) => ({ first });

    injected(createSecond, tokens.firstEntity);

    const parentContainer = new Container();
    parentContainer
      .bind(tokens.firstEntity)
      .toCall(createFirst)
      .inTransientScope();

    const childContainer = new Container(parentContainer);
    childContainer.bind(tokens.secondEntityCreator).toCreator(createSecond);

    const secondEntityCreator = childContainer.get(tokens.secondEntityCreator);
    const secondEntity = secondEntityCreator();

    expect(secondEntity).toStrictEqual<SecondEntity>({
      first: { value: true },
    });
  });

  it('creates a creator which gets an injection from the container from which the creator was got', () => {
    interface FirstEntity {
      value: true;
    }

    interface AnotherFirstEntity {
      value: false;
    }

    interface SecondEntity {
      first: { value: boolean };
    }

    const tokens = {
      firstEntity: token<{ value: boolean }>('FirstEntity'),
      secondEntityCreator: token<Creator<SecondEntity>>('secondEntityCreator'),
    };

    const createSecond = (first: { value: boolean }): SecondEntity => ({
      first,
    });

    injected(createSecond, tokens.firstEntity);

    const parentContainer = new Container();
    parentContainer
      .bind(tokens.firstEntity)
      .toCall((): FirstEntity => ({ value: true }))
      .inTransientScope();
    parentContainer.bind(tokens.secondEntityCreator).toCreator(createSecond);

    const childContainer = new Container(parentContainer);
    childContainer
      .bind(tokens.firstEntity)
      .toCall((): AnotherFirstEntity => ({ value: false }))
      .inTransientScope();

    const parentContainerSecondEntityCreator = parentContainer.get(
      tokens.secondEntityCreator,
    );
    const childContainerSecondEntityCreator = childContainer.get(
      tokens.secondEntityCreator,
    );

    const parentContainerSecondEntity = parentContainerSecondEntityCreator();
    const childContainerSecondEntity = childContainerSecondEntityCreator();

    expect(parentContainerSecondEntity.first).toStrictEqual<FirstEntity>({
      value: true,
    });
    expect(childContainerSecondEntity.first).toStrictEqual<AnotherFirstEntity>({
      value: false,
    });
  });
});
