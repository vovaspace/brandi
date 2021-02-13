import { Tag } from '../pointers';

import { Binding } from './Binding';

export class BindingWhenSyntax {
  constructor(private binding: Binding) {}

  public whenTargetTagged(tag: Tag) {
    this.binding.tag = tag;
  }
}
