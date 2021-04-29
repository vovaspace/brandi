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
