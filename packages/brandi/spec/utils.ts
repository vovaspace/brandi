export type Expect<T extends true> = T;

export type Equal<X, Y> = (<T>() => T extends X ? 1 : 2) extends <
  T
>() => T extends Y ? 1 : 2
  ? true
  : false;

export const setEnv = (value: string): (() => void) => {
  const env = { ...process.env };
  process.env.NODE_ENV = value;

  return () => {
    process.env = { ...env };
  };
};
