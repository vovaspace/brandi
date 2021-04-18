import { TokenType, TokenValue } from 'brandi';

import { useConditions } from '../conditions';
import { useContainer } from '../container';

export const useInjection = <T extends TokenValue>(token: T): TokenType<T> =>
  useContainer().get(token, useConditions());
