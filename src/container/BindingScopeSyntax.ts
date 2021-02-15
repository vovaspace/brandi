import { Constructor } from '../types';
import { Token } from '../pointers';

import { BindingScope, InstanceBinding } from './Binding';
import { BindingWhenSyntax } from './BindingWhenSyntax';
import { BindingsRegistry } from './BindingsRegistry';

export interface BindingScopeSyntax {
  inTransientScope(): BindingWhenSyntax;
  inSingletonScope(): BindingWhenSyntax;
  inResolutionScope(): BindingWhenSyntax;
  inContainerScope(): BindingWhenSyntax;
}

export class BindingScopeSyntax implements BindingScopeSyntax {
  constructor(
    private readonly token: Token,
    private readonly value: Constructor,
    private readonly bindingsRegistry: BindingsRegistry,
  ) {
    this.inTransientScope = this.in.bind(this, BindingScope.Transient);
    this.inSingletonScope = this.in.bind(this, BindingScope.Singleton);
    this.inResolutionScope = this.in.bind(this, BindingScope.Resolution);
    this.inContainerScope = this.in.bind(this, BindingScope.Container);
  }

  private in(scope: BindingScope): BindingWhenSyntax {
    const binding = new InstanceBinding(this.value, scope);
    this.bindingsRegistry.set(this.token, binding);
    return new BindingWhenSyntax(binding);
  }
}
