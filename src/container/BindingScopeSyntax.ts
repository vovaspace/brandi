import { Constructor } from '../types';
import { Token } from '../pointers';

import {
  InstanceBinding,
  InstanceContainerBinding,
  InstanceResolutionBinding,
  InstanceSingletonBinding,
  InstanceTransientBinding,
} from './Binding';
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
    this.inTransientScope = this.in.bind(this, InstanceTransientBinding);
    this.inSingletonScope = this.in.bind(this, InstanceSingletonBinding);
    this.inResolutionScope = this.in.bind(this, InstanceResolutionBinding);
    this.inContainerScope = this.in.bind(this, InstanceContainerBinding);
  }

  private in(Ctor: Constructor<InstanceBinding>): BindingWhenSyntax {
    const binding = new Ctor(this.value);
    this.bindingsRegistry.set(this.token, binding);
    return new BindingWhenSyntax(binding);
  }
}
