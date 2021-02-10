import { Constructor } from '../types';

import type { Container as ContainerType } from './Container';

export enum BindingType {
  Instance,
  Value,
  Factory,
}

export enum BindingScope {
  Transient,
  Singleton,
  Resolution,
  Container,
}

export abstract class Binding {
  constructor(
    public readonly value: unknown,
    public readonly type: BindingType,
    public readonly scope: BindingScope,
  ) {}
}

export abstract class InstanceBinding extends Binding {
  constructor(public readonly value: Constructor, public readonly scope: BindingScope) {
    super(value, BindingType.Instance, scope);
  }
}

export class InstanceTransientBinding extends InstanceBinding {
  constructor(public readonly value: Constructor) {
    super(value, BindingScope.Transient);
  }
}

export class InstanceSingletonBinding extends InstanceBinding {
  public instance: Object | null = null;

  constructor(public readonly value: Constructor) {
    super(value, BindingScope.Singleton);
  }
}

export class InstanceResolutionBinding extends InstanceBinding {
  constructor(public readonly value: Constructor) {
    super(value, BindingScope.Resolution);
  }
}

export class InstanceContainerBinding extends InstanceBinding {
  public readonly instances = new Map<ContainerType, Object>();

  constructor(public readonly value: Constructor) {
    super(value, BindingScope.Container);
  }
}

export class FactoryBinding extends Binding {
  constructor(public readonly value: Constructor) {
    super(value, BindingType.Factory, BindingScope.Singleton);
  }
}

export class ValueBinding extends Binding {
  constructor(public readonly value: unknown) {
    super(value, BindingType.Value, BindingScope.Singleton);
  }
}

export const isInstanceBinding = (binding: Binding): binding is InstanceBinding =>
  binding.type === BindingType.Instance;
export const isInstanceTransientBinding = (
  binding: InstanceBinding,
): binding is InstanceTransientBinding => binding.scope === BindingScope.Transient;
export const isInstanceSingletonBinding = (
  binding: InstanceBinding,
): binding is InstanceSingletonBinding => binding.scope === BindingScope.Singleton;
export const isInstanceResolutionBinding = (
  binding: InstanceBinding,
): binding is InstanceResolutionBinding => binding.scope === BindingScope.Resolution;
export const isInstanceContainerBinding = (
  binding: InstanceBinding,
): binding is InstanceContainerBinding => binding.scope === BindingScope.Container;

export const isFactoryBinding = (binding: Binding): binding is FactoryBinding =>
  binding.type === BindingType.Factory;

export const isValueBinding = (binding: Binding): binding is ValueBinding =>
  binding.type === BindingType.Value;
