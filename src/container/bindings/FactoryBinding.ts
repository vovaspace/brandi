import { UnknownConstructor } from '../../types';

import { Binding, Scope, Type } from './Binding';

export class FactoryBinding implements Binding {
  public readonly type = Type.Factory;

  public readonly scope = Scope.Transient;

  constructor(
    public readonly value: {
      ctor: UnknownConstructor;
      initializer?: (instance: Object, ...args: unknown[]) => unknown;
    },
  ) {}
}
