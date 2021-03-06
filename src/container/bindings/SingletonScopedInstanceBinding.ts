import { Constructor } from '../../types';

import { Scope, Type } from './Binding';
import { InstanceBinding } from './InstanceBinding';

export class SingletonScopedInstanceBinding implements InstanceBinding {
  public readonly type = Type.Instance;

  public readonly scope = Scope.Singleton;

  public instance: Object | null = null;

  constructor(public readonly value: Constructor) {}
}
