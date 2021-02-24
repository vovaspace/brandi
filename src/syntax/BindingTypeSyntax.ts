import { Constructor, Factory } from '../types';
import { Tag, Token } from '../pointers';

import { FactoryBinding, ValueBinding } from '../container/Binding';
import { BindingsRegistry } from '../container/BindingsRegistry';

import { BindingScopeSyntax } from './BindingScopeSyntax';

export class BindingTypeSyntax<T> {
  constructor(
    private readonly bindingsRegistry: BindingsRegistry,
    private readonly token: Token,
    private readonly tag?: Tag,
  ) {}

  public toInstance<K extends Constructor<T>>(ctor: K): BindingScopeSyntax {
    return new BindingScopeSyntax(this.bindingsRegistry, this.token, ctor, this.tag);
  }

  public toValue(value: T): void {
    const binding = new ValueBinding(value, this.tag);
    this.bindingsRegistry.push(binding, this.token);
  }

  public toFactory(
    ctor: T extends Factory<infer R, never[]> ? Constructor<R> : never,
    transformer?: T extends Factory<infer R, infer A>
      ? (instance: R, ...args: A) => R | void
      : never,
  ): void {
    const binding = new FactoryBinding({ ctor, transformer }, this.tag);
    this.bindingsRegistry.push(binding, this.token);
  }
}
