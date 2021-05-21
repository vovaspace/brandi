import { UnknownCreator } from '../../types';

import type { Container } from '../Container';

import { Binding, Scope, Type } from './Binding';

export abstract class InstanceBinding implements Binding {
  public readonly type = Type.Instance;

  public abstract readonly scope: Scope;

  constructor(public readonly impl: UnknownCreator) {}
}

export class InstanceContainerScopedBinding extends InstanceBinding {
  public readonly scope = Scope.Container;

  public readonly cache = new WeakMap<Container, unknown>();
}

export class InstanceResolutionScopedBinding extends InstanceBinding {
  public readonly scope = Scope.Resolution;
}

export class InstanceSingletonScopedBinding extends InstanceBinding {
  public readonly scope = Scope.Singleton;

  public cache?: unknown;
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
