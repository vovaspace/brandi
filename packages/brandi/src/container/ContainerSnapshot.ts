import { BindingsRegistry } from './BindingsRegistry';

export class ContainerSnapshot {
  private readonly registry: BindingsRegistry;

  constructor(registry: BindingsRegistry) {
    this.registry = registry.clone();
  }

  public pick(): BindingsRegistry {
    return this.registry.clone();
  }
}
