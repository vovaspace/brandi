import { ResolutionCondition, UnknownCreator } from '../../types';
import { Token } from '../../pointers';

import {
  EntityContainerScopedBinding,
  EntityResolutionScopedBinding,
  EntitySingletonScopedBinding,
  EntityTransientScopedBinding,
} from '../bindings';
import { BindingsVault } from '../BindingsVault';

export class ScopeSyntax {
  private readonly warningTimeout?: NodeJS.Timeout;

  constructor(
    private readonly vault: BindingsVault,
    private readonly value: UnknownCreator,
    private readonly isConstructor: boolean,
    private readonly token: Token,
    private readonly condition?: ResolutionCondition,
  ) {
    if (process.env.NODE_ENV !== 'production') {
      this.warningTimeout = setTimeout(() => {
        console.warn(
          `Warning: did you forget to set a scope for '${this.token.__symbol.description}' token binding? ` +
            "Call 'inTransientScope()', 'inSingletonScope()', 'inContainerScope()' or 'inResolutionScope()'.",
        );
      });
    }
  }

  public inContainerScope(): void {
    this.set(EntityContainerScopedBinding);
  }

  public inResolutionScope(): void {
    this.set(EntityResolutionScopedBinding);
  }

  public inSingletonScope(): void {
    this.set(EntitySingletonScopedBinding);
  }

  public inTransientScope(): void {
    this.set(EntityTransientScopedBinding);
  }

  private set(
    Ctor:
      | typeof EntityContainerScopedBinding
      | typeof EntityResolutionScopedBinding
      | typeof EntitySingletonScopedBinding
      | typeof EntityTransientScopedBinding,
  ): void {
    if (process.env.NODE_ENV !== 'production')
      clearTimeout(this.warningTimeout!);

    this.vault.set(
      new Ctor(this.value, this.isConstructor),
      this.token,
      this.condition,
    );
  }
}
