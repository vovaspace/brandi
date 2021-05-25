import { ToToken, TokenValue } from '../pointers';
import { UnknownCreator, UnknownCreatorParameters } from '../types';
import { injectsRegistry } from '../registries';

type ToTokens<T extends unknown[]> = {
  [K in keyof T]-?: ToToken<T[K]>;
};

/**
 * @description
 * Registers target injections.
 *
 * @param target - constructor or function whose dependencies will be injected.
 * @param ...tokens - dependency tokens.
 * @returns the `target` first argument.
 *
 * @link https://brandi.js.org/reference/pointers-and-registrators#injectedtarget-tokens
 */
export const injected = <T extends UnknownCreator>(
  target: T,
  ...tokens: ToTokens<UnknownCreatorParameters<T>> extends TokenValue[]
    ? ToTokens<UnknownCreatorParameters<T>>
    : never
) => {
  injectsRegistry.set(target, tokens);
  return target;
};
