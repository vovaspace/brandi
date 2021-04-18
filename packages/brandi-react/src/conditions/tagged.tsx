import React from 'react';
import { Tag } from 'brandi';

import { ConditionsProvider } from './ConditionsProvider';

export const tagged = (...tags: Tag[]) => <P extends unknown>(
  Component: React.ComponentType<P>,
  isolated?: boolean,
): React.FunctionComponent<P> => {
  const Wrapper: React.FunctionComponent<P> = (props) => (
    <ConditionsProvider conditions={tags} isolated={isolated}>
      <Component {...props} />
    </ConditionsProvider>
  );

  Wrapper.displayName = Component.displayName
    ? `Tagged(${Component.displayName})`
    : 'Tagged';

  return Wrapper;
};
