import { Factory, UnknownConstructor, UnknownFunction } from '../../types';
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
   * @example <caption>Example usage of instance factory without arguments.</caption>
   * const someClassFactoryToken = token<Factory<SomeClass>>('someClassFactory');
   *
   * container
   * .bind(someClassFactoryToken)
   * .toInstanceFactory(SomeClass);
   * // Or
   * container
   * .bind(someClassFactoryToken)
   * .toInstanceFactory(SomeClass, (instance) => instance.init());
   *
   * const someClassFactory = container.get(someClassFactoryToken);
   * const someClassInstance = someClassFactory();
   *
   * console.log(someClassInstance instanceof SomeClass) // -> true
   */
  public toInstanceFactory(
    ctor: T extends Factory<infer R>
      ? R extends Object
        ? UnknownConstructor<R>
        : never
      : never,
    initializer?: T extends Factory<infer R> ? (instance: R) => unknown : never,
  ): void;

  /**
   * @example <caption>Example usage of instance factory with arguments.</caption>
   * const someClassFactoryToken = token<Factory<SomeClass, [name: string]>>('someClassFactory');
   *
   * container
   * .bind(someClassFactoryToken)
   * .toInstanceFactory(SomeClass, (instance, name) => instance.setName(name));
   *
   * const someClassFactory = container.get(someClassFactoryToken);
   * const someClassInstance = someClassFactory('Olivia');
   *
   * console.log(someClassInstance instanceof SomeClass) // -> true
   */
  public toInstanceFactory(
    ctor: T extends Factory<infer R, never[]>
      ? R extends Object
        ? UnknownConstructor<R>
        : never
      : never,
    initializer: T extends Factory<infer R, infer A>
      ? (instance: R, ...args: A) => unknown
      : never,
  ): void;

  public toInstanceFactory(
    ctor: UnknownConstructor,
    initializer?: (instance: Object, ...args: unknown[]) => unknown,
  ): void {
    this.bindingsRegistry.set(
      new FactoryBinding({ ctor, initializer }),
      this.token,
      this.tag,
    );
  }
}
