import React from 'react';
import { renderHook } from '@testing-library/react-hooks';
import { tag } from 'brandi';

import { tagged } from '../src';
import { useConditions } from '../src/conditions';

const tags = {
  some: tag('some'),
  other: tag('other'),
  another: tag('another'),
};

const TestComponent: React.FunctionComponent = ({ children }) => (
  <div>{children}</div>
);

describe('conditions', () => {
  it('passes tags through a tagged component', () => {
    const TaggedComponent = tagged(tags.some, tags.other)(TestComponent);

    const wrapper: React.FunctionComponent = ({ children }) => (
      <TaggedComponent>{children}</TaggedComponent>
    );

    const { result } = renderHook(() => useConditions(), { wrapper });

    expect(result.current).toStrictEqual([tags.some, tags.other]);
  });

  it('passes unique tags throw nested tagged components', () => {
    const ParentTaggedComponent = tagged(tags.some, tags.other)(TestComponent);
    const ChildTaggedComponent = tagged(
      tags.other,
      tags.another,
    )(TestComponent);

    const wrapper: React.FunctionComponent = ({ children }) => (
      <ParentTaggedComponent>
        <ChildTaggedComponent>{children}</ChildTaggedComponent>
      </ParentTaggedComponent>
    );

    const { result } = renderHook(() => useConditions(), { wrapper });

    expect(result.current).toStrictEqual([tags.some, tags.other, tags.another]);
  });

  it('does not pass parent tags throw a isolated tagged component', () => {
    const ParentTaggedComponent = tagged(tags.some, tags.other)(TestComponent);
    const ChildTaggedComponent = tagged(tags.another)(TestComponent, {
      isolated: true,
    });

    const wrapper: React.FunctionComponent = ({ children }) => (
      <ParentTaggedComponent>
        <ChildTaggedComponent>{children}</ChildTaggedComponent>
      </ParentTaggedComponent>
    );

    const { result } = renderHook(() => useConditions(), { wrapper });

    expect(result.current).toStrictEqual([tags.another]);
  });
});
