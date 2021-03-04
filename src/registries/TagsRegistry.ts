import { Constructor } from '../types';
import { Tag } from '../pointers';

export class TagsRegistry extends Map<Constructor, Tag[]> {}
