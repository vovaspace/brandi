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
    return new BindingScopeSyntax(this.bindingsRegistry, ctor, this.token, this.tag);
  }

  public toValue(value: T): void {
    this.bindingsRegistry.set(new ValueBinding(value), this.token, this.tag);
  }

  public toFactory(
    ctor: T extends Factory<infer R, never[]> ? Constructor<R> : never,
    transformer?: T extends Factory<infer R, infer A>
      ? (instance: R, ...args: A) => R | void
      : never,
  ): void {
    this.bindingsRegistry.set(new FactoryBinding({ ctor, transformer }), this.token, this.tag);
  }
}
