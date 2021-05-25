export type Tag = symbol & { __tag__: true };

/**
 * @description
 * Creates a unique tag.
 *
 * @param {string} description - a description of the tag to be used in logs and error messages.
 * @returns `Tag`.
 *
 * @link https://brandi.js.org/reference/pointers-and-registrators#tagdescription
 */
export const tag = (description: string): Tag => Symbol(description) as Tag;
