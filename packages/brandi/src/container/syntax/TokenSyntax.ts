import { Tag, Token, TokenType } from '../../pointers';

import { BindingsVault } from '../BindingsVault';

import { TypeSyntax } from './TypeSyntax';

export class TokenSyntax {
  constructor(
    private readonly bindingsVault: BindingsVault,
    private readonly tag?: Tag,
  ) {}

  public bind<T extends Token>(token: T): TypeSyntax<TokenType<T>> {
    return new TypeSyntax<TokenType<T>>(this.bindingsVault, token, this.tag);
  }
}
