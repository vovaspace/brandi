import { TokenType, TokenValue } from 'brandi';
import React from 'react';

import { useConditions } from '../conditions';
import { useContainer } from '../container';

export const useInjection = <T extends TokenValue>(token: T): TokenType<T> => {
  const container = useContainer();
  const conditions = useConditions();

  return React.useMemo(() => container.get(token, conditions), [
    token,
    conditions,
    container,
  ]);
};
