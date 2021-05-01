import { Binding } from './bindings';
import type { BindingsVault } from './BindingsVault';

export class ResolutionCache {
  constructor(
    public readonly instances = new Map<Binding, unknown>(),
    public readonly vaults: BindingsVault[] = [],
  ) {}

  public split(): ResolutionCache {
    return new ResolutionCache(this.instances, this.vaults.slice());
  }
}
