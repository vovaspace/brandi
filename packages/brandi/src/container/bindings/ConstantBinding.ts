import { Binding, Scope, Type } from './Binding';

export class ConstantBinding implements Binding {
  public readonly type = Type.Constant;

  public readonly scope = Scope.Transient;

  constructor(public readonly impl: unknown) {}
}
