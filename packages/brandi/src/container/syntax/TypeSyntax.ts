import {
  Creator,
  Factory,
  UnknownConstructor,
  UnknownFunction,
} from '../../types';
import { Tag, Token } from '../../pointers';

import { ConstantBinding, FactoryBinding } from '../bindings';
import { BindingsVault } from '../BindingsVault';

import { ScopeSyntax } from './ScopeSyntax';

export class TypeSyntax<T> {
  constructor(
    private readonly bindingsVault: BindingsVault,
    private readonly token: Token,
    private readonly tag?: Tag,
  ) {}

  public toInstance<K extends UnknownConstructor<T>>(ctor: K): ScopeSyntax {
    return new ScopeSyntax(
      this.bindingsVault,
      ctor,
      true,
      this.token,
      this.tag,
    );
  }

  public toCall<K extends UnknownFunction<T>>(func: K): ScopeSyntax {
    return new ScopeSyntax(
      this.bindingsVault,
      func,
      false,
      this.token,
      this.tag,
    );
  }

  public toConstant(value: T): void {
    this.bindingsVault.set(new ConstantBinding(value), this.token, this.tag);
  }

  /**
   * @example <caption>Example usage of factory without arguments.</caption>
   * const someClassFactoryToken = token<Factory<SomeClass>>('someClassFactory');
   *
   * container
   * .bind(someClassFactoryToken)
   * .toFactory(SomeClass);
   * // OR
   * container
   * .bind(someClassFactoryToken)
   * .toFactory(SomeClass, (instance) => instance.init());
   *
   * const someClassFactory = container.get(someClassFactoryToken);
   * const someClassInstance = someClassFactory();
   *
   * console.log(someClassInstance instanceof SomeClass); // -> true
   */
  public toFactory(
    ctor: T extends Factory<infer R>
      ? R extends Object
        ? UnknownConstructor<R>
        : never
      : never,
    initializer?: T extends Factory<infer R> ? (instance: R) => unknown : never,
  ): void;

  /**
   * @example <caption>Example usage of factory with arguments.</caption>
   * const someClassFactoryToken = token<Factory<SomeClass, [name: string]>>('someClassFactory');
   *
   * container
   * .bind(someClassFactoryToken)
   * .toFactory(SomeClass, (instance, name) => instance.setName(name));
   *
   * const someClassFactory = container.get(someClassFactoryToken);
   * const someClassInstance = someClassFactory('Olivia');
   *
   * console.log(someClassInstance instanceof SomeClass); // -> true
   */
  public toFactory(
    ctor: T extends Factory<infer R, never[]>
      ? R extends Object
        ? UnknownConstructor<R>
        : never
      : never,
    initializer: T extends Factory<infer R, infer A>
      ? (instance: R, ...args: A) => unknown
      : never,
  ): void;

  public toFactory(
    ctor: UnknownConstructor,
    initializer?: (instance: unknown, ...args: unknown[]) => unknown,
  ): void {
    this.bindingsVault.set(
      new FactoryBinding({ creator: ctor, initializer, isConstructor: true }),
      this.token,
      this.tag,
    );
  }

  /**
   * @example <caption>Example usage of creator without arguments.</caption>
   * function createSomeEntity(): SomeEntity;
   *
   * const someEntityCreatorToken = token<Creator<SomeEntity>>('someEntityCreator');
   *
   * container
   * .bind(someEntityCreatorToken)
   * .toCreator(createSomeEntity);
   * // OR
   * container
   * .bind(someEntityCreatorToken)
   * .toCreator(createSomeEntity, (entity) => entity.init());
   *
   * const someEntityCreator = container.get(someEntityCreatorToken);
   * const someEntity = someEntityCreator();
   *
   * type ReturnedEntity = typeof someEntity; // to be SomeEntity
   */
  public toCreator(
    func: T extends Creator<infer R> ? UnknownFunction<R> : never,
    initializer?: T extends Creator<infer R> ? (entity: R) => unknown : never,
  ): void;

  /**
   * @example <caption>Example usage of creator with arguments.</caption>
   * function createSomeEntity(): SomeEntity;
   *
   * const someEntityCreatorToken = token<Creator<SomeEntity, [name: string]>>('someEntityCreator');
   *
   * container
   * .bind(someEntityCreatorToken)
   * .toCreator(createSomeEntity, (entity, name) => entity.setName(name));
   *
   * const someEntityCreator = container.get(someEntityCreatorToken);
   * const someEntity = someEntityCreator('Olivia');
   *
   * type ReturnedEntity = typeof someEntity; // to be SomeEntity
   */
  public toCreator(
    func: T extends Creator<infer R, never[]> ? UnknownFunction<R> : never,
    initializer: T extends Creator<infer R, infer A>
      ? (entity: R, ...args: A) => unknown
      : never,
  ): void;

  public toCreator(
    func: UnknownFunction,
    initializer?: (entity: unknown, ...args: unknown[]) => unknown,
  ): void {
    this.bindingsVault.set(
      new FactoryBinding({ creator: func, initializer, isConstructor: false }),
      this.token,
      this.tag,
    );
  }
}
