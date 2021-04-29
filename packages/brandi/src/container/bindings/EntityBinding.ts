import {
  UnknownConstructor,
  UnknownCreator,
  UnknownFunction,
} from '../../types';

import type { Container } from '../Container';

import { Binding, Scope, Type } from './Binding';

export interface EntityBinding extends Binding {
  readonly value: UnknownCreator;
  readonly type: Type.Entity;
  readonly isConstructor: boolean;
}

export interface EntityConstructorBinding extends EntityBinding {
  readonly value: UnknownConstructor;
  readonly isConstructor: true;
}

export interface EntityFunctionBinding extends EntityBinding {
  readonly value: UnknownFunction;
  readonly isConstructor: false;
}

export class EntityContainerScopedBinding implements EntityBinding {
  public readonly type = Type.Entity;

  public readonly scope = Scope.Container;

  public readonly cache = new WeakMap<Container, unknown>();

  constructor(
    public readonly value: UnknownCreator,
    public readonly isConstructor: boolean,
  ) {}
}

export class EntityResolutionScopedBinding implements EntityBinding {
  public readonly type = Type.Entity;

  public readonly scope = Scope.Resolution;

  constructor(
    public readonly value: UnknownCreator,
    public readonly isConstructor: boolean,
  ) {}
}

export class EntitySingletonScopedBinding implements EntityBinding {
  public readonly type = Type.Entity;

  public readonly scope = Scope.Singleton;

  public cache?: unknown;

  constructor(
    public readonly value: UnknownCreator,
    public readonly isConstructor: boolean,
  ) {}
}

export class EntityTransientScopedBinding implements EntityBinding {
  public readonly type = Type.Entity;

  public readonly scope = Scope.Transient;

  constructor(
    public readonly value: UnknownCreator,
    public readonly isConstructor: boolean,
  ) {}
}

export const isEntityBinding = (binding: Binding): binding is EntityBinding =>
  binding.type === Type.Entity;

export const isEntityConstructorBinding = (
  binding: EntityBinding,
): binding is EntityConstructorBinding => binding.isConstructor;

export const isEntityContainerScopedBinding = (
  binding: EntityBinding,
): binding is EntityContainerScopedBinding => binding.scope === Scope.Container;

export const isEntityResolutionScopedBinding = (
  binding: EntityBinding,
): binding is EntityResolutionScopedBinding =>
  binding.scope === Scope.Resolution;

export const isEntitySingletonScopedBinding = (
  binding: EntityBinding,
): binding is EntitySingletonScopedBinding => binding.scope === Scope.Singleton;
