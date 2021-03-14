export type UnknownConstructor<T extends Object = Object> = new (
  ...args: any[]
) => T;
export type UnknownFunction<T = unknown> = (...args: any[]) => T;
export type UnknownCreator = UnknownConstructor | UnknownFunction;

export type UnknownCreatorParameters<
  T extends UnknownCreator
> = T extends UnknownConstructor
  ? ConstructorParameters<T>
  : T extends UnknownFunction
  ? Parameters<T>
  : never;

export type Factory<T extends unknown, A extends unknown[] = []> = (
  ...args: A
) => T;
export type Creator<T, A extends unknown[] = []> = Factory<T, A>;
