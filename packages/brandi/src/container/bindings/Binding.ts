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
  readonly impl: unknown;
  readonly type: Type;

  clone?: () => Binding;
}
