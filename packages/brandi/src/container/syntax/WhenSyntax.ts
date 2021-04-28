import { ResolutionCondition } from '../../types';

import { BindSyntax } from './BindSyntax';

export class WhenSyntax extends BindSyntax {
  public when(condition: ResolutionCondition): BindSyntax {
    return new BindSyntax(this.vault, condition);
  }
}
