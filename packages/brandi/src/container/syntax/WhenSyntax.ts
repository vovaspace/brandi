import { ResolutionCondition } from '../../types';

import { BindOrUseSyntax } from './BindOrUseSyntax';

export class WhenSyntax extends BindOrUseSyntax {
  public when(condition: ResolutionCondition): BindOrUseSyntax {
    return new BindOrUseSyntax(this.vault, condition);
  }
}
