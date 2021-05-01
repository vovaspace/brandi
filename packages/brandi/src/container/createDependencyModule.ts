import { DependencyModule } from './DependencyModule';

/**
 * @description Alias for `new DependencyModule()`.
 * @example <caption>Example usage of `createDependencyModule()`.</caption>
 * const dependencyModule = createDependencyModule();
 * console.log(dependencyModule instanceof DependencyModule); // -> true
 */
export const createDependencyModule = () => new DependencyModule();
