export enum Type {
  Constant,
  Instance,
  Factory,
}

export enum Scope {
  Container,
  Resolution,
  Singleton,
  Transient,
}

export interface Binding {
  readonly value: unknown;
  readonly type: Type;
  readonly scope: Scope;
}
