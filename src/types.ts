export type Constructor<T extends Object = Object> = new (...args: any[]) => T;
export type Factory<T extends Object = Object> = () => T;
