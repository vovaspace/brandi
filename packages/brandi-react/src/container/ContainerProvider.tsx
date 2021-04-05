import { Container } from 'brandi';
import React from 'react';

import { ContainerContext } from './ContainerContext';

export const ContainerProvider: React.FunctionComponent<{
  container: Container;
  cloning?: boolean;
}> = ({ children, container, cloning = false }) => {
  const resolvedContainer = React.useMemo(
    () => (cloning ? container.clone() : container),
    [cloning, container],
  );

  return (
    <ContainerContext.Provider value={resolvedContainer}>
      {children}
    </ContainerContext.Provider>
  );
};
