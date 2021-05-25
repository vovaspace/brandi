import { Tag } from '../pointers';
import { UnknownCreator } from '../types';
import { tagsRegistry } from '../registries';

/**
 * @description
 * Tags target.
 *
 * @param target - constructor or function that will be tagged.
 * @param ...tags - tags.
 * @returns the `target` first argument.
 *
 * @link https://brandi.js.org/reference/conditional-bindings
 */
export const tagged = <T extends UnknownCreator>(
  target: T,
  ...tags: Tag[]
): T => {
  tagsRegistry.set(target, tags);
  return target;
};
