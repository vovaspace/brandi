import { Creator } from '../types';
import { Tag } from '../pointers';

export const tagsRegistry = new Map<Creator, Tag[]>();
