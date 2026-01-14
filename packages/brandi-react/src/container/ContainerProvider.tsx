import { Container } from 'brandi';
import React from 'react';

import { ContainerContext } from './ContainerContext';
import { useContainer } from './useContainer';

export const ContainerProvider: React.FunctionComponent<{
  children?: React.ReactNode;
  container: Container;
  isolated?: boolean;
}> = ({ children, container, isolated = false }) => {
  const parentContainer = useContainer(false);

  const extend = !isolated ? parentContainer : null;

  const clonedContainer = React.useMemo(() => {
    const cloned = container.clone();
    if (extend) cloned.extend(extend);
    return cloned;
  }, [container, extend]);

  return (
    <ContainerContext.Provider value={clonedContainer}>
      {children}
    </ContainerContext.Provider>
  );
};
