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

  /**
   * @description
   * The container will return the same instance with each getting.
   * This is similar to being a singleton, however if the container has a child container or a clone,
   * that child container or clone will get an instance unique to it.
   *
   * @link https://brandi.js.org/reference/binding-scopes#incontainerscope
   */
  public inContainerScope(): void {
    this.set(InstanceContainerScopedBinding);
  }

  /**
   * @description
   * The same instance will be got for each getting of this dependency during a single resolution chain.
   *
   * @link https://brandi.js.org/reference/binding-scopes#inresolutionscope
   */
  public inResolutionScope(): void {
    this.set(InstanceResolutionScopedBinding);
  }

  /**
   * @description
   * Each getting will return the same instance.
   *
   * @link https://brandi.js.org/reference/binding-scopes#insingletonscope
   */
  public inSingletonScope(): void {
    this.set(InstanceSingletonScopedBinding);
  }

  /**
   * @description
   * New instance will be created with each getting.
   *
   * @link https://brandi.js.org/reference/binding-scopes#intransientscope
   */
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
