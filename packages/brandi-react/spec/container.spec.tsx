import { Container, createContainer, token } from 'brandi';
import React from 'react';
import { renderHook } from '@testing-library/react-hooks';

import { ContainerProvider } from '../src';
import { useContainer } from '../src/container';

describe('container', () => {
  describe('useContainer', () => {
    it("throws error when a container is not passed through 'ContainerProvider'", () => {
      const { result } = renderHook(() => useContainer());

      expect(result.error).toBeInstanceOf(Error);
      expect(result.error).toMatchSnapshot();
    });

    it("returns 'null' in not strict mode when a container is not passed through 'ContainerProvider'", () => {
      const { result } = renderHook(() => useContainer(false));

      expect(result.current).toBeNull();
    });
  });

  describe('ContainerProvider', () => {
    it('passes a container clone', () => {
      const TOKENS = {
        some: token<number>('some'),
      };

      const someValue = 1;
      const anotherValue = 2;

      const container = createContainer();
      container.bind(TOKENS.some).toConstant(someValue);

      const wrapper: React.FunctionComponent = ({ children }) => (
        <ContainerProvider container={container}>{children}</ContainerProvider>
      );

      const { result } = renderHook(() => useContainer(), { wrapper });

      container.bind(TOKENS.some).toConstant(anotherValue);

      expect(result.current).not.toBe(container);
      expect(result.current).toBeInstanceOf(Container);
      expect(result.current.get(TOKENS.some)).toBe(someValue);
    });

    it('binds the parent container from the parent context', () => {
      const TOKENS = {
        some: token<number>('some'),
        another: token<number>('another'),
      };

      const someValue = 1;
      const anotherValue = 2;

      const parentContainer = createContainer();
      parentContainer.bind(TOKENS.some).toConstant(someValue);

      const childContainer = createContainer();
      childContainer.bind(TOKENS.another).toConstant(anotherValue);

      const wrapper: React.FunctionComponent = ({ children }) => (
        <ContainerProvider container={parentContainer}>
          <ContainerProvider container={childContainer}>
            {children}
          </ContainerProvider>
        </ContainerProvider>
      );

      const { result } = renderHook(() => useContainer(), { wrapper });

      expect(result.current.get(TOKENS.some)).toBe(someValue);
      expect(result.current.get(TOKENS.another)).toBe(anotherValue);
    });

    it("keeps the original parent container with 'isolated' prop", () => {
      const TOKENS = {
        some: token<number>('some'),
      };

      const someValue = 1;
      const anotherValue = 2;

      const parentContainer = createContainer();
      parentContainer.bind(TOKENS.some).toConstant(someValue);

      const anotherParentContainer = createContainer();
      anotherParentContainer.bind(TOKENS.some).toConstant(anotherValue);

      const childContainer = createContainer().extend(parentContainer);

      const wrapper: React.FunctionComponent = ({ children }) => (
        <ContainerProvider container={anotherParentContainer}>
          <ContainerProvider container={childContainer} isolated>
            {children}
          </ContainerProvider>
        </ContainerProvider>
      );

      const { result } = renderHook(() => useContainer(), { wrapper });

      expect(result.current.get(TOKENS.some)).toBe(someValue);
    });
  });
});
