import { Constructor } from '../types';
import { Tag } from '../pointers';
import { tagsRegistry } from '../globals';

export const tagged = <T extends Constructor>(
  target: T,
  ...tags: Tag[]
): void => {
  tagsRegistry.set(target, tags);
};
