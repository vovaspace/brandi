export type Token<T = unknown> = symbol & { __type__: T };
export type TokenType<T> = T extends Token ? T['__type__'] : never;

export type TokensType<T> = {
  [K in keyof T]: T[K] extends Token ? TokenType<T[K]> : TokensType<T[K]>;
};

export const token = <T>(description: string) =>
  Symbol(description) as Token<T>;
