import { BindingsVault } from './BindingsVault';
import { WhenSyntax } from './syntax';

export class DependencyModule extends WhenSyntax {
  constructor() {
    super(new BindingsVault());
  }
}
