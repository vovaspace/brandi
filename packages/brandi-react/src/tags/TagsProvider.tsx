import React from 'react';
import { Tag } from 'brandi';

import { TagsContext } from './TagsContext';
import { useTags } from './useTags';

export const TagsProvider: React.FunctionComponent<{
  tags: Tag[];
  locked?: boolean;
}> = ({ children, tags, locked = false }) => {
  const currentTags = useTags();
  const resolvedTags = React.useMemo(
    () =>
      currentTags && !locked ? [...new Set([...currentTags, ...tags])] : tags,
    [currentTags, tags, locked],
  );

  return (
    <TagsContext.Provider value={resolvedTags}>{children}</TagsContext.Provider>
  );
};
