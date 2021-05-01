import { UnknownCreator } from '../../types';

import { Binding, Scope, Type } from './Binding';

export class FactoryBinding implements Binding {
  public readonly type = Type.Factory;

  public readonly scope = Scope.Transient;

  constructor(
    public readonly impl: {
      creator: UnknownCreator;
      initializer?: (entity: unknown, ...args: unknown[]) => unknown;
    },
  ) {}
}

export const isFactoryBinding = (binding: Binding): binding is FactoryBinding =>
  binding.type === Type.Factory;
