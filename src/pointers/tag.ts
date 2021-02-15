export type Tag = symbol & { __tag__: true };

export const tag = (description: string): Tag => Symbol(description) as Tag;
