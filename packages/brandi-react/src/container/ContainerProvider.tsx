import { Container } from 'brandi';
import React from 'react';

import { ContainerContext } from './ContainerContext';

export const ContainerProvider: React.FunctionComponent<{
  container: Container;
}> = ({ children, container }) => {
  const parentContainer = React.useContext(ContainerContext);
  const clonedContainer = React.useMemo(() => container.clone(), [container]);

  if (parentContainer) clonedContainer.parent = parentContainer;

  return (
    <ContainerContext.Provider value={clonedContainer}>
      {children}
    </ContainerContext.Provider>
  );
};
