import { Tag, Token } from '../pointers';
import { Constructor } from '../types';

import { BindingScope, InstanceBinding } from '../container/Binding';
import { BindingsRegistry } from '../container/BindingsRegistry';

export interface BindingScopeSyntax {
  inTransientScope(): void;
  inSingletonScope(): void;
  inResolutionScope(): void;
  inContainerScope(): void;
}

export class BindingScopeSyntax implements BindingScopeSyntax {
  constructor(
    private readonly bindingsRegistry: BindingsRegistry,
    private readonly token: Token,
    private readonly value: Constructor,
    private readonly tag?: Tag,
  ) {
    this.inTransientScope = this.in.bind(this, BindingScope.Transient);
    this.inSingletonScope = this.in.bind(this, BindingScope.Singleton);
    this.inResolutionScope = this.in.bind(this, BindingScope.Resolution);
    this.inContainerScope = this.in.bind(this, BindingScope.Container);
  }

  private in(scope: BindingScope): void {
    const binding = new InstanceBinding(this.value, scope, this.tag);
    this.bindingsRegistry.push(binding, this.token);
  }
}
