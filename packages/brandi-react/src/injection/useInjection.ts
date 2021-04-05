import { Token, TokenType } from 'brandi';

import { useContainer } from '../container';
import { useTags } from '../tags';

export const useInjection = <T extends Token>(token: T): TokenType<T> =>
  useContainer().get(token, useTags());
