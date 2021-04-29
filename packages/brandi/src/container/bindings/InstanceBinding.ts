import { UnknownCreator } from '../../types';

import type { Container } from '../Container';

import { Binding, Scope, Type } from './Binding';

export interface InstanceBinding extends Binding {
  readonly value: UnknownCreator;
  readonly type: Type.Instance;
}

export class InstanceContainerScopedBinding implements InstanceBinding {
  public readonly type = Type.Instance;

  public readonly scope = Scope.Container;

  public readonly cache = new WeakMap<Container, unknown>();

  constructor(public readonly value: UnknownCreator) {}
}

export class InstanceResolutionScopedBinding implements InstanceBinding {
  public readonly type = Type.Instance;

  public readonly scope = Scope.Resolution;

  constructor(public readonly value: UnknownCreator) {}
}

export class InstanceSingletonScopedBinding implements InstanceBinding {
  public readonly type = Type.Instance;

  public readonly scope = Scope.Singleton;

  public cache?: unknown;

  constructor(public readonly value: UnknownCreator) {}
}

export class InstanceTransientScopedBinding implements InstanceBinding {
  public readonly type = Type.Instance;

  public readonly scope = Scope.Transient;

  constructor(public readonly value: UnknownCreator) {}
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
