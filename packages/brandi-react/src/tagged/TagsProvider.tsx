import React from 'react';
import { Tag } from 'brandi';

import { TagsContext } from './TagsContext';
import { useTags } from './useTags';

export const TagsProvider: React.FunctionComponent<{
  tags: Tag[];
  isolated?: boolean;
}> = ({ children, tags, isolated = false }) => {
  const currentTags = useTags();
  const resolvedTags = React.useMemo(
    () =>
      currentTags && !isolated ? [...new Set([...currentTags, ...tags])] : tags,
    [currentTags, tags, isolated],
  );

  return (
    <TagsContext.Provider value={resolvedTags}>{children}</TagsContext.Provider>
  );
};
