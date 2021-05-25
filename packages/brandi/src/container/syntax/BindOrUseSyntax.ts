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

  /**
   * @description
   * Binds the token to an implementation.
   *
   * @param token - a token to be bound.
   *
   * @returns
   * Binding Type syntax:
   *   - `toConstant(value)`
   *   - `toInstance(creator)`
   *   - `toFactory(creator, [initializer])`
   *
   * @link https://brandi.js.org/reference/container#bindtoken
   */
  public bind<T extends Token>(token: T): TypeSyntax<TokenType<T>> {
    return new TypeSyntax<TokenType<T>>(this.vault, token, this.condition);
  }

  /**
   * @description
   * Uses bindings from a dependency module.
   *
   * @param tokens - tokens to be used from a dependency module.
   * @returns `.from(module)` syntax.
   *
   * @link https://brandi.js.org/reference/container#usetokensfrommodule
   */
  public use(...tokens: Token[]): FromSyntax {
    return new FromSyntax(
      this.vault,
      tokens,
      BindOrUseSyntax.vault,
      this.condition,
    );
  }
}
