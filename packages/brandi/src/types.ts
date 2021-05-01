import { Tag } from './pointers';

type UnknownConstructor<T extends Object = Object> = new (...args: any[]) => T;
type UnknownFunction<T = unknown> = (...args: any[]) => T;

export type UnknownCreator<T = unknown> =
  | UnknownConstructor<T>
  | UnknownFunction<T>;

export type UnknownCreatorParameters<
  T extends UnknownCreator
> = T extends UnknownConstructor
  ? ConstructorParameters<T>
  : T extends UnknownFunction
  ? Parameters<T>
  : never;

export type ResolutionCondition = Tag | UnknownCreator;

export type Factory<T extends unknown, A extends unknown[] = []> = (
  ...args: A
) => T;
