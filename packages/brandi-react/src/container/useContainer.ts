import { Container } from 'brandi';
import React from 'react';

import { ContainerContext } from './ContainerContext';

export function useContainer(strict?: true): Container;
export function useContainer(strict?: false): Container | null;
export function useContainer(strict: boolean = true): Container | null {
  const container = React.useContext(ContainerContext);

  if (strict && container === null) {
    throw new Error(
      "Could not get a container from a context. Did you forget to pass the container through 'ContainerProvider'?",
    );
  }

  return container;
}
