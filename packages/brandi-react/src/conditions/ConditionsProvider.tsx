import React from 'react';
import { ResolutionCondition } from 'brandi';

import { ConditionsContext } from './ConditionsContext';
import { useConditions } from './useConditions';

export const ConditionsProvider: React.FunctionComponent<{
  children?: React.ReactNode;
  conditions: ResolutionCondition[];
  isolated?: boolean;
}> = ({ children, conditions, isolated = false }) => {
  const currentConditions = useConditions();
  const resolvedConditions = React.useMemo(
    () =>
      currentConditions.length > 0 && !isolated
        ? [...new Set([...currentConditions, ...conditions])]
        : conditions,
    [currentConditions, conditions, isolated],
  );

  return (
    <ConditionsContext.Provider value={resolvedConditions}>
      {children}
    </ConditionsContext.Provider>
  );
};
