import {
  Creator,
  Factory,
  UnknownConstructor,
  UnknownFunction,
} from '../../types';
import { Tag, Token } from '../../pointers';

import { FactoryBinding, ValueBinding } from '../bindings';
import { BindingsRegistry } from '../BindingsRegistry';

import { BindingScopeSyntax } from './BindingScopeSyntax';

export class BindingTypeSyntax<T> {
  constructor(
    private readonly bindingsRegistry: BindingsRegistry,
    private readonly token: Token,
    private readonly tag?: Tag,
  ) {}

  public toInstance<K extends UnknownConstructor<T>>(
    ctor: K,
  ): BindingScopeSyntax {
    return new BindingScopeSyntax(
      this.bindingsRegistry,
      ctor,
      true,
      this.token,
      this.tag,
    );
  }

  public toCall<K extends UnknownFunction<T>>(func: K): BindingScopeSyntax {
    return new BindingScopeSyntax(
      this.bindingsRegistry,
      func,
      false,
      this.token,
      this.tag,
    );
  }

  public toValue(value: T): void {
    this.bindingsRegistry.set(new ValueBinding(value), this.token, this.tag);
  }

  /**
   * @example <caption>Example usage of factory without arguments.</caption>
   * const someClassFactoryToken = token<Factory<SomeClass>>('someClassFactory');
   *
   * container
   * .bind(someClassFactoryToken)
   * .toFactory(SomeClass);
   * // Or
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
    this.bindingsRegistry.set(
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
   * // Or
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
    this.bindingsRegistry.set(
      new FactoryBinding({ creator: func, initializer, isConstructor: false }),
      this.token,
      this.tag,
    );
  }
}
