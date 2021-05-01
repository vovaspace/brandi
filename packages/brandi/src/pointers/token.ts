export interface TokenValue<T = unknown> {
  /**
   * @description Token type.
   */
  __t: T;

  /**
   * @description Description of token.
   */
  __d: string;

  /**
   * @description Unique symbol.
   */

  __s: symbol;

  /**
   * @description Is binding by token optional.
   */
  __o: boolean;
}

export interface RequiredToken<T = unknown> extends TokenValue<T> {
  __o: false;
}

export interface OptionalToken<T = unknown> extends TokenValue<T> {
  __o: true;
}

export interface Token<T = unknown> extends RequiredToken<T> {
  optional: OptionalToken<T>;
}

export type TokenType<T extends TokenValue> = T extends RequiredToken
  ? T['__t']
  : T['__t'] | undefined;

export type TokenTypeMap<T> = {
  [K in keyof T]: T[K] extends Token ? TokenType<T[K]> : TokenTypeMap<T[K]>;
};

export type ToToken<T> = undefined extends T
  ? OptionalToken<Exclude<T, undefined>>
  : RequiredToken<T>;

export const token = <T>(description: string): Token<T> => {
  const s = Symbol(description);
  return {
    __t: (null as unknown) as T,
    __d: description,
    __s: s,
    __o: false,
    optional: {
      __t: (null as unknown) as T,
      __d: description,
      __s: s,
      __o: true,
    },
  };
};
