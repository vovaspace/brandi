import { Container, createContainer, token } from 'brandi';
import React from 'react';
import { renderHook } from '@testing-library/react-hooks';

import { ContainerProvider } from '../src';
import { useContainer } from '../src/container';

describe('container', () => {
  it("passes a container through 'ContainerProvider'", () => {
    const container = createContainer();

    const wrapper: React.FunctionComponent = ({ children }) => (
      <ContainerProvider container={container}>{children}</ContainerProvider>
    );

    const { result } = renderHook(() => useContainer(), { wrapper });

    expect(result.current).toBe(container);
  });

  it("passes a container clone through 'ContainerProvider' with 'cloning' prop", () => {
    const container = createContainer();

    const tokens = {
      some: token<number>('some'),
    };

    container.bind(tokens.some).toConstant(1);

    const wrapper: React.FunctionComponent = ({ children }) => (
      <ContainerProvider container={container} cloning>
        {children}
      </ContainerProvider>
    );

    const { result } = renderHook(() => useContainer(), { wrapper });

    container.bind(tokens.some).toConstant(2);

    expect(result.current).not.toBe(container);
    expect(result.current).toBeInstanceOf(Container);
    expect(result.current.get(tokens.some)).toBe(1);
  });

  it("throws error when a container is not passed through 'ContainerProvider'", () => {
    const { result } = renderHook(() => useContainer());

    expect(result.error).toBeInstanceOf(Error);
    expect(result.error).toMatchSnapshot();
  });
});
