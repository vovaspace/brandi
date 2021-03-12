export type UnknownConstructor<T extends Object = Object> = new (
  ...args: any[]
) => T;
export type UnknownFunction<T = unknown> = (...args: any[]) => T;

export type Creator = UnknownConstructor | UnknownFunction;
export type Factory<T, A extends unknown[] = []> = (...args: A) => T;

export type CreatorParameters<T extends Creator> = T extends UnknownConstructor
  ? ConstructorParameters<T>
  : T extends UnknownFunction
  ? Parameters<T>
  : never;
