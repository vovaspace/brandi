export enum Type {
  Instance,
  Value,
  Factory,
}

export enum Scope {
  Transient,
  Singleton,
  Resolution,
  Container,
}

export interface Binding {
  readonly value: unknown;
  readonly type: Type;
  readonly scope: Scope;
}
