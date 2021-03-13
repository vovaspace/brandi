import {
  UnknownConstructor,
  UnknownCreator,
  UnknownFunction,
} from '../../types';

import { Binding, Scope, Type } from './Binding';

export class FactoryBinding implements Binding {
  public readonly type = Type.Factory;

  public readonly scope = Scope.Transient;

  constructor(
    public readonly value: {
      creator: UnknownCreator;
      initializer?: (entity: unknown, ...args: unknown[]) => unknown;
      isConstructor: boolean;
    },
  ) {}
}

export interface FactoryConstructorBinding extends FactoryBinding {
  readonly value: {
    creator: UnknownConstructor;
    initializer?: (instance: unknown, ...args: unknown[]) => unknown;
    isConstructor: true;
  };
}

export interface FactoryFunctionBinding extends FactoryBinding {
  readonly value: {
    creator: UnknownFunction;
    initializer?: (entity: unknown, ...args: unknown[]) => unknown;
    isConstructor: false;
  };
}

export const isFactoryBinding = (binding: Binding): binding is FactoryBinding =>
  binding.type === Type.Factory;

export const isFactoryConstructorBinding = (
  binding: FactoryBinding,
): binding is FactoryConstructorBinding => binding.value.isConstructor;
