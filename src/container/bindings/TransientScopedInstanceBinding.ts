import { Constructor } from '../../types';

import { Scope, Type } from './Binding';
import { InstanceBinding } from './InstanceBinding';

export class TransientScopedInstanceBinding implements InstanceBinding {
  public readonly type = Type.Instance;

  public readonly scope = Scope.Transient;

  constructor(public readonly value: Constructor) {}
}
