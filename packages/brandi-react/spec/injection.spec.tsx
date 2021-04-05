import { createContainer, tag, token } from 'brandi';
import React from 'react';
import { renderHook } from '@testing-library/react-hooks';

import {
  ContainerProvider,
  createInjectionHooks,
  tagged,
  useInjection,
} from '../src';

describe('injection', () => {
  it('uses a dependency', () => {
    const tokens = {
      some: token<number>('some'),
    };

    const value = 1;

    const container = createContainer();
    container.bind(tokens.some).toConstant(value);

    const wrapper: React.FunctionComponent = ({ children }) => (
      <ContainerProvider container={container}>{children}</ContainerProvider>
    );

    const { result } = renderHook(() => useInjection(tokens.some), { wrapper });

    expect(result.current).toBe(value);
  });

  it('uses a tagged dependency', () => {
    const tokens = {
      some: token<number>('some'),
    };

    const tags = {
      some: tag('some'),
    };

    const value = 1;
    const anotherValue = 2;

    const container = createContainer();
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

  it('creates injection hooks', () => {
    const tokens = {
      some: token<number>('some'),
      another: token<string>('another'),
    };

    const hooks = createInjectionHooks(tokens.some, tokens.another);
    const [useSome, useAnother] = hooks;

    const someValue = 1;
    const anotherValue = '2';

    const container = createContainer();
    container.bind(tokens.some).toConstant(someValue);
    container.bind(tokens.another).toConstant(anotherValue);

    const wrapper: React.FunctionComponent = ({ children }) => (
      <ContainerProvider container={container}>{children}</ContainerProvider>
    );

    const { result: someResult } = renderHook(() => useSome(), { wrapper });
    const { result: anotherResult } = renderHook(() => useAnother(), {
      wrapper,
    });

    expect(someResult.current).toBe(someValue);
    expect(anotherResult.current).toBe(anotherValue);
  });
});
