import { Constructor } from '../types';

import { Scope, Type } from './Binding';
import { InstanceBinding } from './InstanceBinding';

export class ResolutionScopedInstanceBinding implements InstanceBinding {
  public readonly type = Type.Instance;

  public readonly scope = Scope.Resolution;

  constructor(public readonly value: Constructor) {}
}
