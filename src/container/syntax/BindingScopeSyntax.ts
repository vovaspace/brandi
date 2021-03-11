import { Tag, Token } from '../../pointers';
import { Constructor } from '../../types';

import {
  Binding,
  ContainerScopedInstanceBinding,
  ResolutionScopedInstanceBinding,
  SingletonScopedInstanceBinding,
  TransientScopedInstanceBinding,
} from '../bindings';
import { BindingsRegistry } from '../BindingsRegistry';

export class BindingScopeSyntax {
  private readonly warningTimeout?: number;

  constructor(
    private readonly bindingsRegistry: BindingsRegistry,
    private readonly value: Constructor,
    private readonly token: Token,
    private readonly tag?: Tag,
  ) {
    if (process.env.NODE_ENV === 'development') {
      this.warningTimeout = setTimeout(() => {
        console.warn(
          `Warning: did you forget to set a scope for '${this.token.description}' token binding? Call 'inTransientScope()', 'inSingletonScope()', 'inContainerScope()' or 'inResolutionScope()'.`,
        );
      });
    }
  }

  public inContainerScope(): void {
    this.set(new ContainerScopedInstanceBinding(this.value));
  }

  public inResolutionScope(): void {
    this.set(new ResolutionScopedInstanceBinding(this.value));
  }

  public inSingletonScope(): void {
    this.set(new SingletonScopedInstanceBinding(this.value));
  }

  public inTransientScope(): void {
    this.set(new TransientScopedInstanceBinding(this.value));
  }

  private set(binding: Binding): void {
    this.bindingsRegistry.set(binding, this.token, this.tag);

    if (process.env.NODE_ENV === 'development')
      clearTimeout(this.warningTimeout);
  }
}
