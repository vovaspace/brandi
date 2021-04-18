import { TokenType, TokenValue } from 'brandi';

import { useContainer } from '../container';
import { useTags } from '../tagged';

export const useInjection = <T extends TokenValue>(token: T): TokenType<T> =>
  useContainer().get(token, useTags());
