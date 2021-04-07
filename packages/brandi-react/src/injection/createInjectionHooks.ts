import { Token, TokenType } from 'brandi';

import { useInjection } from './useInjection';

type InjectionHooks<T extends Token[]> = {
  [K in keyof T]: () => TokenType<T[K]>;
};

export const createInjectionHooks = <T extends Token[]>(
  ...tokens: T
): InjectionHooks<T> =>
  tokens.map((token) => () => useInjection(token)) as InjectionHooks<T>;
