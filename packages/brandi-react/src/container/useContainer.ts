import { Container } from 'brandi';
import React from 'react';

import { ContainerContext } from './ContainerContext';

export const useContainer = (): Container => {
  const container = React.useContext(ContainerContext);

  if (container === null || container === undefined) {
    throw new Error(
      "Could not get a container from a context. Did you forget to pass the container through 'ContainerProvider'?",
    );
  }

  return container;
};
