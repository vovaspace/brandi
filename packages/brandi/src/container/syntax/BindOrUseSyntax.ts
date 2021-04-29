import { Token, TokenType } from '../../pointers';
import { ResolutionCondition } from '../../types';

import { BindingsVault } from '../BindingsVault';

import { FromSyntax } from './FromSyntax';
import { TypeSyntax } from './TypeSyntax';

export class BindOrUseSyntax {
  protected static vault(target: BindOrUseSyntax) {
    return target.vault;
  }

  constructor(
    protected vault: BindingsVault,
    private readonly condition?: ResolutionCondition,
  ) {}

  public bind<T extends Token>(token: T): TypeSyntax<TokenType<T>> {
    return new TypeSyntax<TokenType<T>>(this.vault, token, this.condition);
  }

  public use(...tokens: Token[]): FromSyntax {
    return new FromSyntax(
      this.vault,
      tokens,
      BindOrUseSyntax.vault,
      this.condition,
    );
  }
}
