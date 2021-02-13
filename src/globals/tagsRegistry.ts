import { Constructor } from '../types';
import { Tag } from '../pointers';

export const tagsRegistry = new Map<Constructor, Tag[]>();
