import { Constructor, Factory } from '../types';
import { FactoryBinding, ValueBinding } from '../bindings';
import { Tag, Token } from '../pointers';
import { BindingsRegistry } from '../registries';

import { BindingScopeSyntax } from './BindingScopeSyntax';

export class BindingTypeSyntax<T> {
  constructor(
    private readonly bindingsRegistry: BindingsRegistry,
    private readonly token: Token,
    private readonly tag?: Tag,
  ) {}

  public toInstance<K extends Constructor<T>>(ctor: K): BindingScopeSyntax {
    return new BindingScopeSyntax(
      this.bindingsRegistry,
      ctor,
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
    ctor: T extends Factory<infer R> ? Constructor<R> : never,
    transformer?: T extends Factory<infer R> ? (instance: R) => unknown : never,
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
    ctor: T extends Factory<infer R, never[]> ? Constructor<R> : never,
    transformer: T extends Factory<infer R, infer A>
      ? (instance: R, ...args: A) => unknown
      : never,
  ): void;
  public toFactory(
    ctor: Constructor,
    transformer?: (instance: Object, ...args: unknown[]) => unknown,
  ): void {
    this.bindingsRegistry.set(
      new FactoryBinding({ ctor, transformer }),
      this.token,
      this.tag,
    );
  }
}
