import { ResolutionCondition } from '../../types';

import { BindOrUseSyntax } from './BindOrUseSyntax';

export class WhenSyntax extends BindOrUseSyntax {
  /**
   * @description
   * Creates a conditional binding.
   *
   * @param condition - a condition.
   * @returns `bind` or `use` syntax.
   *
   * @link https://brandi.js.org/reference/conditional-bindings
   */
  public when(condition: ResolutionCondition): BindOrUseSyntax {
    return new BindOrUseSyntax(this.vault, condition);
  }
}
