import { Container } from './Container';

/**
 * @description Alias for `new Container(parent)`.
 * @example <caption>Example usage of `createContainer(parent)`.</caption>
 * const container = createContainer(parent);
 * console.log(container instanceof Container); // -> true
 */
export const createContainer = (
  ...args: ConstructorParameters<typeof Container>
) => new Container(...args);
