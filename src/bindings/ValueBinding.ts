import { Binding, Scope, Type } from './Binding';

export class ValueBinding implements Binding {
  public readonly type = Type.Value;

  public readonly scope = Scope.Transient;

  constructor(public readonly value: unknown) {}
}
