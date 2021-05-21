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

  public toConstant(value: Dependency): void {
    this.vault.set(new ConstantBinding(value), this.token, this.condition);
  }

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

  public toInstance(creator: UnknownCreator<Dependency>): ScopeSyntax {
    return new ScopeSyntax(this.vault, creator, this.token, this.condition);
  }
}
