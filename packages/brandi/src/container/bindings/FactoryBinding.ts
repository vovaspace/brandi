import { UnknownCreator } from '../../types';

import { Binding, Type } from './Binding';

export type FactoryInitializer = (
  instance: unknown,
  ...args: unknown[]
) => unknown;

export class FactoryBinding implements Binding {
  public readonly type = Type.Factory;

  constructor(
    public readonly impl: {
      creator: UnknownCreator;
      initializer?: FactoryInitializer;
    },
  ) {}
}

export const isFactoryBinding = (binding: Binding): binding is FactoryBinding =>
  binding.type === Type.Factory;
