import { Creator, UnknownConstructor, UnknownFunction } from '../../types';

import type { Container } from '../Container';

import { Binding, Scope, Type } from './Binding';

export interface CreatorBinding extends Binding {
  readonly value: Creator;
  readonly type: Type.Creator;
  readonly isConstructor: boolean;
}

export interface ConstructorCreatorBinding extends CreatorBinding {
  readonly value: UnknownConstructor;
  readonly isConstructor: true;
}

export interface FunctionCreatorBinding extends CreatorBinding {
  readonly value: UnknownFunction;
  readonly isConstructor: false;
}

export class CreatorContainerScopedBinding implements CreatorBinding {
  public readonly type = Type.Creator;

  public readonly scope = Scope.Container;

  public readonly cache = new WeakMap<Container, unknown>();

  constructor(
    public readonly value: Creator,
    public readonly isConstructor: boolean,
  ) {}
}

export class CreatorResolutionScopedBinding implements CreatorBinding {
  public readonly type = Type.Creator;

  public readonly scope = Scope.Resolution;

  constructor(
    public readonly value: Creator,
    public readonly isConstructor: boolean,
  ) {}
}

export class CreatorSingletonScopedBinding implements CreatorBinding {
  public readonly type = Type.Creator;

  public readonly scope = Scope.Singleton;

  public hasCached = false;

  public cache?: unknown;

  constructor(
    public readonly value: Creator,
    public readonly isConstructor: boolean,
  ) {}

  public setCache(value: unknown) {
    this.cache = value;
    this.hasCached = true;
  }
}

export class CreatorTransientScopedBinding implements CreatorBinding {
  public readonly type = Type.Creator;

  public readonly scope = Scope.Transient;

  constructor(
    public readonly value: Creator,
    public readonly isConstructor: boolean,
  ) {}
}
