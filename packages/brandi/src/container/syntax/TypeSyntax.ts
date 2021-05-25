import {
  AsyncFactory,
  Factory,
  ResolutionCondition,
  UnknownCreator,
} from '../../types';
import { Token } from '../../pointers';

import {
  ConstantBinding,
  FactoryBinding,
  FactoryInitializer,
} from '../bindings';
import { BindingsVault } from '../BindingsVault';

import { ScopeSyntax } from './ScopeSyntax';

export class TypeSyntax<Dependency> {
  constructor(
    private readonly vault: BindingsVault,
    private readonly token: Token,
    private readonly condition?: ResolutionCondition,
  ) {}

  /**
   * @description
   * Binds the token to the constant value.
   *
   * @param value - the value that will be bound to the token.
   *
   * @link https://brandi.js.org/reference/binding-types#toconstantvalue
   */
  public toConstant(value: Dependency): void {
    this.vault.set(new ConstantBinding(value), this.token, this.condition);
  }

  /**
   * @description
   * Binds the token to the factory.
   *
   * @param creator - the instance creator which the factory will use;
   * @param [initializer] - optional function called after the instance is created.
   *
   * @link https://brandi.js.org/reference/binding-types#tofactorycreator-initializer
   */
  public toFactory(
    creator: Dependency extends AsyncFactory<infer Instance, never[]>
      ? UnknownCreator<Promise<Instance>>
      : never,
    initializer?: Dependency extends AsyncFactory<
      infer Instance,
      infer Arguments
    >
      ? (instance: Instance, ...args: Arguments) => unknown
      : never,
  ): void;

  /**
   * @description
   * Binds the token to the factory.
   *
   * @param creator - the instance creator which the factory will use;
   * @param [initializer] - optional function called after the instance is created.
   *
   * @link https://brandi.js.org/reference/binding-types#tofactorycreator-initializer
   */
  public toFactory(
    creator: Dependency extends AsyncFactory<infer Instance, never[]>
      ? UnknownCreator<Instance>
      : never,
    initializer: Dependency extends AsyncFactory<
      infer Instance,
      infer Arguments
    >
      ? (instance: Instance, ...args: Arguments) => Promise<unknown>
      : never,
  ): void;

  /**
   * @description
   * Binds the token to the factory.
   *
   * @param creator - the instance creator which the factory will use;
   * @param [initializer] - optional function called after the instance is created.
   *
   * @link https://brandi.js.org/reference/binding-types#tofactorycreator-initializer
   */
  public toFactory<InitializerReturnType>(
    creator: Dependency extends Factory<infer Instance, never[]>
      ? Instance extends Promise<unknown>
        ? never
        : UnknownCreator<Instance>
      : never,
    initializer?: Dependency extends Factory<infer Instance, infer Arguments>
      ? InitializerReturnType extends Promise<unknown>
        ? never
        : (instance: Instance, ...args: Arguments) => InitializerReturnType
      : never,
  ): void;

  public toFactory(
    creator: UnknownCreator,
    initializer?: FactoryInitializer,
  ): void {
    this.vault.set(
      new FactoryBinding({ creator, initializer }),
      this.token,
      this.condition,
    );
  }

  /**
   * @description
   * Binds the token to an instance in one of the scopes.
   *
   * @param creator - the instance creator that will be bound to the token.
   *
   * @returns
   * Scope syntax:
   *   - `inSingletonScope()`
   *   - `inTransientScope()`
   *   - `inContainerScope()`
   *   - `inResolutionScope()`
   *
   * @link https://brandi.js.org/reference/binding-types#toinstancecreator
   */
  public toInstance(creator: UnknownCreator<Dependency>): ScopeSyntax {
    return new ScopeSyntax(this.vault, creator, this.token, this.condition);
  }
}
