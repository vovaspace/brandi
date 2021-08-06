import { UnknownCreator } from '../../types';

import type { BindingsVault } from '../BindingsVault';

import { Binding, Scope, Type } from './Binding';

export abstract class InstanceBinding implements Binding {
  public readonly type = Type.Instance;

  public abstract readonly scope: Scope;

  constructor(public readonly impl: UnknownCreator) {}
}

export class InstanceContainerScopedBinding extends InstanceBinding {
  public readonly scope = Scope.Container;

  public readonly cache = new WeakMap<BindingsVault, unknown>();
}

export class InstanceResolutionScopedBinding extends InstanceBinding {
  public readonly scope = Scope.Resolution;
}

export class InstanceSingletonScopedBinding extends InstanceBinding {
  public readonly scope = Scope.Singleton;

  public cache?: unknown;

  public clone?(): InstanceSingletonScopedBinding;

  constructor(public readonly impl: UnknownCreator) {
    super(impl);

    if (process.env.NODE_ENV !== 'production') {
      this.clone = (): InstanceSingletonScopedBinding => {
        const binding = new InstanceSingletonScopedBinding(this.impl);
        binding.cache = this.cache;
        return binding;
      };
    }
  }
}

export class InstanceTransientScopedBinding extends InstanceBinding {
  public readonly scope = Scope.Transient;
}

export const isInstanceBinding = (
  binding: Binding,
): binding is InstanceBinding => binding.type === Type.Instance;

export const isInstanceContainerScopedBinding = (
  binding: InstanceBinding,
): binding is InstanceContainerScopedBinding =>
  binding.scope === Scope.Container;

export const isInstanceResolutionScopedBinding = (
  binding: InstanceBinding,
): binding is InstanceResolutionScopedBinding =>
  binding.scope === Scope.Resolution;

export const isInstanceSingletonScopedBinding = (
  binding: InstanceBinding,
): binding is InstanceSingletonScopedBinding =>
  binding.scope === Scope.Singleton;
