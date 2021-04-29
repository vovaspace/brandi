import { Factory, ResolutionCondition, UnknownCreator } from '../../types';
import { Token } from '../../pointers';

import { ConstantBinding, FactoryBinding } from '../bindings';
import { BindingsVault } from '../BindingsVault';

import { ScopeSyntax } from './ScopeSyntax';

export class TypeSyntax<T> {
  constructor(
    private readonly vault: BindingsVault,
    private readonly token: Token,
    private readonly condition?: ResolutionCondition,
  ) {}

  public toConstant(value: T): void {
    this.vault.set(new ConstantBinding(value), this.token, this.condition);
  }

  /**
   * @example <caption>Example usage of factory without arguments.</caption>
   * const someClassFactoryToken = token<Factory<SomeClass>>('Factory<SomeClass>');
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
    creator: T extends Factory<infer R> ? UnknownCreator<R> : never,
    initializer?: T extends Factory<infer R> ? (instance: R) => unknown : never,
  ): void;

  /**
   * @example <caption>Example usage of factory with arguments.</caption>
   * const someClassFactoryToken = token<Factory<SomeClass, [name: string]>>('Factory<SomeClass>');
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
    creator: T extends Factory<infer R, never[]> ? UnknownCreator<R> : never,
    initializer: T extends Factory<infer R, infer A>
      ? (instance: R, ...args: A) => unknown
      : never,
  ): void;

  public toFactory(
    creator: UnknownCreator,
    initializer?: (instance: unknown, ...args: unknown[]) => unknown,
  ): void {
    this.vault.set(
      new FactoryBinding({ creator, initializer }),
      this.token,
      this.condition,
    );
  }

  public toInstance<K extends UnknownCreator<T>>(creator: K): ScopeSyntax {
    return new ScopeSyntax(this.vault, creator, this.token, this.condition);
  }
}
