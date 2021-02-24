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

export interface Binding {
  readonly value: unknown;
  readonly type: BindingType;
  readonly scope: BindingScope;
  readonly tag?: Tag;
}

export class InstanceBinding implements Binding {
  public readonly type = BindingType.Instance;

  public instance: Object | null = null;

  public readonly instances = new Map<ContainerType, Object>();

  constructor(
    public readonly value: Constructor,
    public readonly scope: BindingScope,
    public readonly tag?: Tag,
  ) {}
}

export class FactoryBinding implements Binding {
  public readonly type = BindingType.Factory;

  public readonly scope = BindingScope.Transient;

  constructor(
    public readonly value: {
      ctor: Constructor;
      transformer?: (instance: Object, ...args: unknown[]) => Object | void;
    },
    public readonly tag?: Tag,
  ) {}
}

export class ValueBinding implements Binding {
  public readonly type = BindingType.Value;

  public readonly scope = BindingScope.Transient;

  constructor(public readonly value: unknown, public readonly tag?: Tag) {}
}

export const isInstanceBinding = (binding: Binding): binding is InstanceBinding =>
  binding.type === BindingType.Instance;
export const isFactoryBinding = (binding: Binding): binding is FactoryBinding =>
  binding.type === BindingType.Factory;
