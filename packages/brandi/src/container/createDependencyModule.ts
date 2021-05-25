import { DependencyModule } from './DependencyModule';

/**
 * @description
 * Alias for `new DependencyModule()`.
 *
 * @example
 * <caption>Example usage of `createDependencyModule()`.</caption>
 *
 * const dependencyModule = createDependencyModule();
 * console.log(dependencyModule instanceof DependencyModule); // → true
 *
 * @link https://brandi.js.org/reference/dependency-modules#createdependencymodule
 */
export const createDependencyModule = () => new DependencyModule();
