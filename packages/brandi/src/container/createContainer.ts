import { Container } from './Container';

/**
 * @description Alias for `new Container()`.
 * @example <caption>Example usage of `createContainer()`.</caption>
 * const container = createContainer();
 * console.log(container instanceof Container); // -> true
 */
export const createContainer = (
  ...args: ConstructorParameters<typeof Container>
) => new Container(...args);
