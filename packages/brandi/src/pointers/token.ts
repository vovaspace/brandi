export interface TokenValue<T = unknown> {
  __type: T;
  __symbol: symbol;
  __isOptional: boolean;
}

export interface RequiredToken<T = unknown> extends TokenValue<T> {
  __isOptional: false;
}

export interface OptionalToken<T = unknown> extends TokenValue<T> {
  __isOptional: true;
}

export interface Token<T = unknown> extends RequiredToken<T> {
  optional: OptionalToken<T>;
}

export type TokenType<T extends TokenValue> = T extends RequiredToken
  ? T['__type']
  : T['__type'] | undefined;

export type TokenTypeMap<T> = {
  [K in keyof T]: T[K] extends Token ? TokenType<T[K]> : TokenTypeMap<T[K]>;
};

export type ToToken<T> = undefined extends T
  ? OptionalToken<Exclude<T, undefined>>
  : RequiredToken<T>;

export const token = <T>(description: string): Token<T> => {
  const symbol = Symbol(description);
  return {
    __type: (null as unknown) as T,
    __symbol: symbol,
    __isOptional: false,
    optional: {
      __type: (null as unknown) as T,
      __symbol: symbol,
      __isOptional: true,
    },
  };
};
