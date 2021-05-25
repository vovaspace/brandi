import { ResolutionCondition } from '../../types';
import { Token } from '../../pointers';

import { BindingsVault } from '../BindingsVault';
import type { DependencyModule } from '../DependencyModule';

import type { BindOrUseSyntax } from './BindOrUseSyntax';

export class FromSyntax {
  constructor(
    private readonly vault: BindingsVault,
    private readonly tokens: Token[],
    private readonly getVault: (target: BindOrUseSyntax) => BindingsVault,
    private readonly condition?: ResolutionCondition,
  ) {}

  /**
   * @description
   * Uses bindings from the dependency module.
   *
   * @param dependencyModule - the dependency module from which the tokens will be used.
   *
   * @link https://brandi.js.org/reference/container#usetokensfrommodule
   */
  public from(dependencyModule: DependencyModule): void {
    const { tokens } = this;
    for (let i = 0, len = tokens.length; i < len; i += 1) {
      this.vault.set(
        this.getVault(dependencyModule),
        tokens[i]!,
        this.condition,
      );
    }
  }
}
