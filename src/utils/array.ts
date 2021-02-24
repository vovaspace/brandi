export const find = <T>(arr: T[], cb: (value: T) => boolean) => {
  const { length } = arr;
  for (let i = 0; i < length; i += 1) {
    if (cb(arr[i]!)) return arr[i];
  }
  return undefined;
};

export const includes = <T>(arr: T[], value: unknown) => {
  const { length } = arr;
  for (let i = 0; i < length; i += 1) {
    if (value === arr[i]!) return true;
  }
  return false;
};
