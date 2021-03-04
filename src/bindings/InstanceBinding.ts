import { Constructor } from '../types';

import { Binding, Type } from './Binding';

export interface InstanceBinding extends Binding {
  readonly value: Constructor;
  readonly type: Type.Instance;
}
