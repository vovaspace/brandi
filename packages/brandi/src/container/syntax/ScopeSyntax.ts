import { Tag, Token } from '../../pointers';
import { UnknownCreator } from '../../types';

import {
  Binding,
  EntityContainerScopedBinding,
  EntityResolutionScopedBinding,
  EntitySingletonScopedBinding,
  EntityTransientScopedBinding,
} from '../bindings';
import { BindingsVault } from '../BindingsVault';

export class ScopeSyntax {
  private readonly warningTimeout?: NodeJS.Timeout;

  constructor(
    private readonly bindingsVault: BindingsVault,
    private readonly value: UnknownCreator,
    private readonly isConstructor: boolean,
    private readonly token: Token,
    private readonly tag?: Tag,
  ) {
    if (process.env.NODE_ENV !== 'production') {
      this.warningTimeout = setTimeout(() => {
        console.warn(
          `Warning: did you forget to set a scope for '${this.token.description}' token binding? Call 'inTransientScope()', 'inSingletonScope()', 'inContainerScope()' or 'inResolutionScope()'.`,
        );
      });
    }
  }

  public inContainerScope(): void {
    this.set(new EntityContainerScopedBinding(this.value, this.isConstructor));
  }

  public inResolutionScope(): void {
    this.set(new EntityResolutionScopedBinding(this.value, this.isConstructor));
  }

  public inSingletonScope(): void {
    this.set(new EntitySingletonScopedBinding(this.value, this.isConstructor));
  }

  public inTransientScope(): void {
    this.set(new EntityTransientScopedBinding(this.value, this.isConstructor));
  }

  private set(binding: Binding): void {
    if (process.env.NODE_ENV !== 'production')
      clearTimeout(this.warningTimeout!);

    this.bindingsVault.set(binding, this.token, this.tag);
  }
}
