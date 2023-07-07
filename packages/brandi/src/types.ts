import { Tag } from './pointers';

export type ResolutionCondition = Tag | UnknownCreator;

type UnknownConstructor<T> = new (
  ...args: never[]
) => T;

type UnknownFunction<T = unknown> = (...args: never[]) => T;

export type UnknownCreator<T = unknown> =
  | UnknownConstructor<T>
  | UnknownFunction<T>;

export type UnknownCreatorParameters<
  T extends UnknownCreator
> = T extends UnknownConstructor<T>
  ? ConstructorParameters<T>
  : T extends UnknownFunction
  ? Parameters<T>
  : never;

export type Factory<T extends unknown, A extends unknown[] = []> = (
  ...args: A
) => T;

export type AsyncFactory<T extends unknown, A extends unknown[] = []> = Factory<
  Promise<T>,
  A
>;
