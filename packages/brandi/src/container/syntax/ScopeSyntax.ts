import { ResolutionCondition, UnknownCreator } from '../../types';
import { Token } from '../../pointers';

import {
  InstanceContainerScopedBinding,
  InstanceResolutionScopedBinding,
  InstanceSingletonScopedBinding,
  InstanceTransientScopedBinding,
} from '../bindings';
import { BindingsVault } from '../BindingsVault';

export class ScopeSyntax {
  private readonly warningTimeout?: NodeJS.Timeout;

  constructor(
    private readonly vault: BindingsVault,
    private readonly impl: UnknownCreator,
    private readonly token: Token,
    private readonly condition?: ResolutionCondition,
  ) {
    if (process.env.NODE_ENV !== 'production') {
      this.warningTimeout = setTimeout(() => {
        console.warn(
          `Warning: did you forget to set a scope for '${this.token.__d}' token binding? ` +
            "Call 'inTransientScope()', 'inSingletonScope()', 'inContainerScope()' or 'inResolutionScope()'.",
        );
      });
    }
  }

  public inContainerScope(): void {
    this.set(InstanceContainerScopedBinding);
  }

  public inResolutionScope(): void {
    this.set(InstanceResolutionScopedBinding);
  }

  public inSingletonScope(): void {
    this.set(InstanceSingletonScopedBinding);
  }

  public inTransientScope(): void {
    this.set(InstanceTransientScopedBinding);
  }

  private set(
    Ctor:
      | typeof InstanceContainerScopedBinding
      | typeof InstanceResolutionScopedBinding
      | typeof InstanceSingletonScopedBinding
      | typeof InstanceTransientScopedBinding,
  ): void {
    if (process.env.NODE_ENV !== 'production')
      clearTimeout(this.warningTimeout!);

    this.vault.set(new Ctor(this.impl), this.token, this.condition);
  }
}
