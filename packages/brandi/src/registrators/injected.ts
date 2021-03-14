import { UnknownCreator, UnknownCreatorParameters } from '../types';
import { Token } from '../pointers';
import { injectsRegistry } from '../globals';

export type Tokens<T extends unknown[]> = {
  [K in keyof T]: Token<T[K]>;
} &
  Array<Token<T[number]>>;

export const injected = <T extends UnknownCreator>(
  target: T,
  ...tokens: Tokens<UnknownCreatorParameters<T>>
) => {
  injectsRegistry.set(target, tokens);
  return target;
};
