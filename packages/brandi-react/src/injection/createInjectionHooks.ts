import { TokenType, TokenValue } from 'brandi';

import { useInjection } from './useInjection';

type InjectionHooks<T extends TokenValue[]> = {
  [K in keyof T]: T[K] extends TokenValue ? () => TokenType<T[K]> : never;
};

export const createInjectionHooks = <T extends TokenValue[]>(
  ...tokens: T
): InjectionHooks<T> =>
  tokens.map((token) => () => useInjection(token)) as InjectionHooks<T>;
