export enum Type {
  Constant,
  Entity,
  Factory,
}

export enum Scope {
  Container,
  Global,
  Resolution,
  Singleton,
  Transient,
}

export interface Binding {
  readonly value: unknown;
  readonly type: Type;
  readonly scope: Scope;
}
