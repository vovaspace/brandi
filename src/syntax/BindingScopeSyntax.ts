import {
  Binding,
  ContainerScopedInstanceBinding,
  ResolutionScopedInstanceBinding,
  SingletonScopedInstanceBinding,
  TransientScopedInstanceBinding,
} from '../bindings';
import { Tag, Token } from '../pointers';
import { BindingsRegistry } from '../registries';
import { Constructor } from '../types';

export class BindingScopeSyntax implements BindingScopeSyntax {
  constructor(
    private readonly bindingsRegistry: BindingsRegistry,
    private readonly value: Constructor,
    private readonly token: Token,
    private readonly tag?: Tag,
  ) {}

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
  }
}
