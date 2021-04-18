import { ToToken, TokenValue } from '../pointers';
import { UnknownCreator, UnknownCreatorParameters } from '../types';
import { injectsRegistry } from '../globals';

type ToTokens<T extends unknown[]> = {
  [K in keyof T]-?: ToToken<T[K]>;
};

export const injected = <T extends UnknownCreator>(
  target: T,
  ...tokens: ToTokens<UnknownCreatorParameters<T>> extends TokenValue[]
    ? ToTokens<UnknownCreatorParameters<T>>
    : never
) => {
  injectsRegistry.set(target, tokens);
  return target;
};
