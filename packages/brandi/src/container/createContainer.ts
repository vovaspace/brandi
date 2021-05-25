import { Container } from './Container';

/**
 * @description
 * Alias for `new Container()`.
 *
 * @example
 * <caption>Example usage of `createContainer()`.</caption>
 *
 * const container = createContainer();
 * console.log(container instanceof Container); // → true
 *
 * @link https://brandi.js.org/reference/container#createcontainer
 */
export const createContainer = () => new Container();
