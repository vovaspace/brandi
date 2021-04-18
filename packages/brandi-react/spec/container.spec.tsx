import { Container, createContainer, token } from 'brandi';
import React from 'react';
import { renderHook } from '@testing-library/react-hooks';

import { ContainerProvider } from '../src';
import { useContainer } from '../src/container';

describe('container', () => {
  it("passes a container clone through 'ContainerProvider'", () => {
    const tokens = {
      some: token<number>('some'),
    };

    const someValue = 1;
    const anotherValue = 2;

    const container = createContainer();
    container.bind(tokens.some).toConstant(someValue);

    const wrapper: React.FunctionComponent = ({ children }) => (
      <ContainerProvider container={container}>{children}</ContainerProvider>
    );

    const { result } = renderHook(() => useContainer(), { wrapper });

    container.bind(tokens.some).toConstant(anotherValue);

    expect(result.current).not.toBe(container);
    expect(result.current).toBeInstanceOf(Container);
    expect(result.current.get(tokens.some)).toBe(someValue);
  });

  it('binds the parent container from the parent context', () => {
    const tokens = {
      some: token<number>('some'),
      another: token<number>('another'),
    };

    const someValue = 1;
    const anotherValue = 2;

    const parentContainer = createContainer();
    parentContainer.bind(tokens.some).toConstant(someValue);

    const childContainer = createContainer();
    childContainer.bind(tokens.another).toConstant(anotherValue);

    const wrapper: React.FunctionComponent = ({ children }) => (
      <ContainerProvider container={parentContainer}>
        <ContainerProvider container={childContainer}>
          {children}
        </ContainerProvider>
      </ContainerProvider>
    );

    const { result } = renderHook(() => useContainer(), { wrapper });

    expect(result.current.get(tokens.some)).toBe(someValue);
    expect(result.current.get(tokens.another)).toBe(anotherValue);
  });

  it("keeps the original parent container with 'isolated' prop", () => {
    const tokens = {
      some: token<number>('some'),
    };

    const someValue = 1;
    const anotherValue = 2;

    const parentContainer = createContainer();
    parentContainer.bind(tokens.some).toConstant(someValue);

    const anotherParentContainer = createContainer();
    anotherParentContainer.bind(tokens.some).toConstant(anotherValue);

    const childContainer = createContainer(parentContainer);

    const wrapper: React.FunctionComponent = ({ children }) => (
      <ContainerProvider container={anotherParentContainer}>
        <ContainerProvider container={childContainer} isolated>
          {children}
        </ContainerProvider>
      </ContainerProvider>
    );

    const { result } = renderHook(() => useContainer(), { wrapper });

    expect(result.current.get(tokens.some)).toBe(someValue);
  });

  it("throws error when a container is not passed through 'ContainerProvider'", () => {
    const { result } = renderHook(() => useContainer());

    expect(result.error).toBeInstanceOf(Error);
    expect(result.error).toMatchSnapshot();
  });
});
