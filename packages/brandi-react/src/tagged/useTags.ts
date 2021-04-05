import React from 'react';

import { TagsContext } from './TagsContext';

export const useTags = () => React.useContext(TagsContext);
