export const setEnv = (value: string): (() => void) => {
  const env = { ...process.env };
  process.env.NODE_ENV = value;

  return () => {
    process.env = { ...env };
  };
};
