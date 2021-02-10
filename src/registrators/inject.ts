import { Constructor } from '../types';
import { Token } from '../token';
import { typesRegistry } from '../typesRegistry';

type TokensTuple<T extends [...unknown[]]> = {
  [Index in keyof T]: Token<T[Index]>;
} &
  Array<Token>;

export const inject = <T extends Constructor>(
  target: T,
  tokens: TokensTuple<ConstructorParameters<T>>,
): void => {
  typesRegistry.set(target, tokens);
};
