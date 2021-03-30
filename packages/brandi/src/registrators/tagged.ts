import { Tag } from '../pointers';
import { UnknownCreator } from '../types';
import { tagsRegistry } from '../globals';

export const tagged = <T extends UnknownCreator>(
  target: T,
  ...tags: Tag[]
): T => {
  tagsRegistry.set(target, tags);
  return target;
};