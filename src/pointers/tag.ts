export type Tag = symbol & { __tag__: true };

export const tag = (name: string): Tag => Symbol(name) as Tag;
