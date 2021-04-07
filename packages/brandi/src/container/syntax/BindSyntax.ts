import { Token, TokenType } from '../../pointers';
import { ResolutionCondition } from '../../types';

import { BindingsVault } from '../BindingsVault';

import { TypeSyntax } from './TypeSyntax';

export class BindSyntax {
  constructor(
    private readonly bindingsVault: BindingsVault,
    private readonly condition?: ResolutionCondition,
  ) {}

  public bind<T extends Token>(token: T): TypeSyntax<TokenType<T>> {
    return new TypeSyntax<TokenType<T>>(
      this.bindingsVault,
      token,
      this.condition,
    );
  }
}
