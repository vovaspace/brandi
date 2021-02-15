import { Constructor } from '../types';
import { Tag } from '../pointers';

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
  public tag: Tag | null = null;

  constructor(
    public readonly value: unknown,
    public readonly type: BindingType,
    public readonly scope: BindingScope,
  ) {}
}

export class InstanceBinding extends Binding {
  public instance: Object | null = null;

  public readonly instances = new Map<ContainerType, Object>();

  constructor(public readonly value: Constructor, public readonly scope: BindingScope) {
    super(value, BindingType.Instance, scope);
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
export const isFactoryBinding = (binding: Binding): binding is FactoryBinding =>
  binding.type === BindingType.Factory;
