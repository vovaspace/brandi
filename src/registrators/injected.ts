import { Creator, CreatorParameters } from '../types';
import { Token } from '../pointers';
import { injectsRegistry } from '../globals';

export type Tokens<T extends unknown[]> = {
  [K in keyof T]: Token<T[K]>;
} &
  Array<Token<T[number]>>;

export const injected = <T extends Creator>(
  target: T,
  ...tokens: Tokens<CreatorParameters<T>>
) => {
  injectsRegistry.set(target, tokens);
  return target;
};
