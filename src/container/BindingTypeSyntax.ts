import { Constructor, Factory } from '../types';
import { Token } from '../pointers';

import { FactoryBinding, ValueBinding } from './Binding';
import { BindingScopeSyntax } from './BindingScopeSyntax';
import { BindingWhenSyntax } from './BindingWhenSyntax';
import { BindingsRegistry } from './BindingsRegistry';

export class BindingTypeSyntax<T> {
  constructor(private readonly bindingsRegistry: BindingsRegistry, private readonly token: Token) {}

  public toInstance<K extends Constructor<T>>(ctor: K): BindingScopeSyntax {
    return new BindingScopeSyntax(this.token, ctor, this.bindingsRegistry);
  }

  public toValue(value: T): BindingWhenSyntax {
    const binding = new ValueBinding(value);
    this.bindingsRegistry.set(this.token, binding);
    return new BindingWhenSyntax(binding);
  }

  public toFactory(
    ctor: T extends Factory<infer R, never[]> ? Constructor<R> : never,
    transformer?: T extends Factory<infer R, infer A>
      ? (instance: R, ...args: A) => R | void
      : never,
  ): BindingWhenSyntax {
    const binding = new FactoryBinding({ ctor, transformer });
    this.bindingsRegistry.set(this.token, binding);
    return new BindingWhenSyntax(binding);
  }
}
