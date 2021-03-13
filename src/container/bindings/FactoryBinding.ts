import { Creator, UnknownConstructor, UnknownFunction } from '../../types';

import { Binding, Scope, Type } from './Binding';

export class FactoryBinding implements Binding {
  public readonly type = Type.Factory;

  public readonly scope = Scope.Transient;

  constructor(
    public readonly value: {
      creator: Creator;
      initializer?: (result: unknown, ...args: unknown[]) => unknown;
      isConstructor: boolean;
    },
  ) {}
}

export interface ConstructorFactoryBinding extends FactoryBinding {
  readonly value: {
    creator: UnknownConstructor;
    initializer?: (instance: unknown, ...args: unknown[]) => unknown;
    isConstructor: true;
  };
}

export interface FunctionFactoryBinding extends FactoryBinding {
  readonly value: {
    creator: UnknownFunction;
    initializer?: (result: unknown, ...args: unknown[]) => unknown;
    isConstructor: false;
  };
}

export const isFactoryBinding = (binding: Binding): binding is FactoryBinding =>
  binding.type === Type.Factory;

export const isConstructorFactoryBinding = (
  binding: FactoryBinding,
): binding is ConstructorFactoryBinding => binding.value.isConstructor;
