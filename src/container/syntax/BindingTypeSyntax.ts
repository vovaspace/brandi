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
   * @example <caption>Example usage of factory without arguments.</caption>
   * const someClassFactoryToken = token<Factory<SomeClass>>('someClassFactory');
   *
   * container.bind(someClassFactoryToken).toFactory(SomeClass);
   * // Or
   * container.bind(someClassFactoryToken).toFactory(SomeClass, (instance) => instance.init());
   *
   * const someClassFactory = container.get(someClassFactoryToken);
   * const someClassInstance = someClassFactory();
   *
   * console.log(someClassInstance instanceof SomeClass) // -> true
   */
  public toFactory(
    ctor: T extends Factory<infer R> ? UnknownConstructor<R> : never,
    initializer?: T extends Factory<infer R> ? (instance: R) => unknown : never,
  ): void;
  /**
   * @example <caption>Example usage of factory with arguments.</caption>
   * const someClassFactoryToken = token<Factory<SomeClass, [name: string]>>('someClassFactory');
   *
   * container.bind(someClassFactoryToken).toFactory(SomeClass, (instance, name) => instance.setName(name));
   *
   * const someClassFactory = container.get(someClassFactoryToken);
   * const someClassInstance = someClassFactory('Olivia');
   *
   * console.log(someClassInstance instanceof SomeClass) // -> true
   */
  public toFactory(
    ctor: T extends Factory<infer R, never[]> ? UnknownConstructor<R> : never,
    initializer: T extends Factory<infer R, infer A>
      ? (instance: R, ...args: A) => unknown
      : never,
  ): void;
  public toFactory(
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
