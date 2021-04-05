import React from 'react';
import { Tag } from 'brandi';

import { TagsProvider } from './TagsProvider';

export const tagged = (...tags: Tag[]) => <P extends unknown>(
  Component: React.ComponentType<P>,
  isolated?: boolean,
): React.ComponentType<P> => {
  const Wrapper: React.FunctionComponent<P> = (props) => (
    <TagsProvider tags={tags} isolated={isolated}>
      <Component {...props} />
    </TagsProvider>
  );

  Wrapper.displayName = Component.displayName
    ? `Tagged(${Component.displayName})`
    : 'Tagged';

  return Wrapper;
};
