import { Constructor } from '../types';
import { Token } from '../pointers';
import { injectsRegistry } from '../globals';

export type Tokens<T extends unknown[]> = {
  [K in keyof T]: Token<T[K]>;
} &
  Array<Token<T[number]>>;

export const injected = <T extends Constructor>(
  target: T,
  ...tokens: Tokens<ConstructorParameters<T>>
): void => {
  injectsRegistry.set(target, tokens);
};
