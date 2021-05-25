import { Binding, Type } from './Binding';

export class ConstantBinding implements Binding {
  public readonly type = Type.Constant;

  constructor(public readonly impl: unknown) {}
}
