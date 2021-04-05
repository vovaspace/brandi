import { createContainer, tag, token } from 'brandi';
import React from 'react';
import { renderHook } from '@testing-library/react-hooks';

import { ContainerProvider, tagged, useInjection } from '../src';

describe('injection', () => {
  it('uses a dependency', () => {
    const container = createContainer();

    const tokens = {
      some: token<number>('some'),
    };

    const value = 1;

    container.bind(tokens.some).toConstant(value);

    const wrapper: React.FunctionComponent = ({ children }) => (
      <ContainerProvider container={container}>{children}</ContainerProvider>
    );

    const { result } = renderHook(() => useInjection(tokens.some), { wrapper });

    expect(result.current).toBe(value);
  });

  it('uses a tagged dependency', () => {
    const container = createContainer();

    const tokens = {
      some: token<number>('some'),
    };

    const tags = {
      some: tag('some'),
    };

    const value = 1;
    const anotherValue = 2;

    container.bind(tokens.some).toConstant(value);
    container.when(tags.some).bind(tokens.some).toConstant(anotherValue);

    const TaggedComponent = tagged(tags.some)(({ children }) => (
      <div>{children}</div>
    ));

    const wrapper: React.FunctionComponent = ({ children }) => (
      <ContainerProvider container={container}>
        <TaggedComponent>{children}</TaggedComponent>
      </ContainerProvider>
    );

    const { result } = renderHook(() => useInjection(tokens.some), { wrapper });

    expect(result.current).toBe(anotherValue);
  });
});
