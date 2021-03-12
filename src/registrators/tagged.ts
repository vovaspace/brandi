import { Creator } from '../types';
import { Tag } from '../pointers';
import { tagsRegistry } from '../globals';

export const tagged = <T extends Creator>(target: T, ...tags: Tag[]): T => {
  tagsRegistry.set(target, tags);
  return target;
};
