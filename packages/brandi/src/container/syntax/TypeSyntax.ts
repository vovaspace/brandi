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
   *
   * @example
   * <caption>Example usage of constant binding.</caption>
   *
   * import { Container, token } from 'brandi';
   *
   * const TOKENS = {
   *   apiKey: token<string>('API Key'),
   * };
   *
   * const container = new Container();
   * container.bind(TOKENS.apiKey).toConstant('#key9428');
   *
   * const key = container.get(TOKENS.apiKey);
   *
   * console.log(key); // → '#key9428'
   *
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
   *
   * @example
   * <caption>Example usage of async factory without arguments.</caption>
   *
   * import { AsyncFactory, Container, token } from 'brandi';
   *
   * class ApiService {
   *   init() {
   *     // ...
   *   }
   * }
   *
   * const createApiServiceAsync = async () => new ApiService();
   *
   * const TOKENS = {
   *   apiServiceFactory: token<AsyncFactory<ApiService>>('AsyncFactory<ApiService>'),
   * };
   *
   * const container = new Container();
   *
   * container
   *   .bind(TOKENS.apiServiceFactory)
   *   // Creates a factory with async instance creation.
   *   .toFactory(createApiServiceAsync, (instance) => instance.init());
   *
   * const apiServiceFactory = container.get(TOKENS.apiServiceFactory);
   *
   * // Will wait for the creation resolution and then call the initializer, if there is one.
   * const apiService = await apiServiceFactory();
   *
   * console.log(apiService instanceof ApiService); // → true
   *
   *
   * @example
   * <caption>Example usage of async factory with arguments.</caption>
   *
   * import { AsyncFactory, Container, token } from 'brandi';
   *
   * class ApiService {
   *   init(key: string) {
   *     // ...
   *   }
   * }
   *
   * const createApiServiceAsync = async () => new ApiService();
   *
   * const TOKENS = {
   *   apiServiceFactory: token<AsyncFactory<ApiService, [key: string]>>('AsyncFactory<ApiService>'),
   * };
   *
   * const container = new Container();
   *
   * container
   *   .bind(TOKENS.apiServiceFactory)
   *   // Creates a factory with async instance creation.
   *   .toFactory(createApiServiceAsync, (instance, key) => instance.init(key));
   *
   * const apiServiceFactory = container.get(TOKENS.apiServiceFactory);
   *
   * // Will wait for the creation resolution and then call the initializer, if there is one.
   * const apiService = await apiServiceFactory('#key9428');
   *
   * console.log(apiService instanceof ApiService); // → true
   *
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
   *
   * @example
   * <caption>Example usage of async factory without arguments.</caption>
   *
   * import { AsyncFactory, Container, token } from 'brandi';
   *
   * class ApiService {
   *   async init() {
   *     // ...
   *   }
   * }
   *
   * const TOKENS = {
   *   apiServiceFactory: token<AsyncFactory<ApiService>>('AsyncFactory<ApiService>'),
   * };
   *
   * const container = new Container();
   *
   * container
   *   .bind(TOKENS.apiServiceFactory)
   *   // Creates a factory with async initializer.
   *   .toFactory(ApiService, (instance) => instance.init());
   *
   * const apiServiceFactory = container.get(TOKENS.apiServiceFactory);
   *
   * // Will wait for the initializing resolution.
   * const apiService = await apiServiceFactory();
   *
   * console.log(apiService instanceof ApiService); // → true
   *
   *
   * @example
   * <caption>Example usage of async factory with arguments.</caption>
   *
   * import { AsyncFactory, Container, token } from 'brandi';
   *
   * class ApiService {
   *   async init(key: string) {
   *     // ...
   *   }
   * }
   *
   * const TOKENS = {
   *   apiServiceFactory: token<AsyncFactory<ApiService, [key: string]>>('AsyncFactory<ApiService>'),
   * };
   *
   * const container = new Container();
   *
   * container
   *   .bind(TOKENS.apiServiceFactory)
   *   // Creates a factory with async initializer.
   *   .toFactory(ApiService, (instance, key) => instance.init(key));
   *
   * const apiServiceFactory = container.get(TOKENS.apiServiceFactory);
   *
   * // Will wait for the initializing resolution.
   * const apiService = await apiServiceFactory('#key9428');
   *
   * console.log(apiService instanceof ApiService); // → true
   *
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
   *
   * @example
   * <caption>Example usage of factory without arguments.</caption>
   *
   * import { Container, Factory, token } from 'brandi';
   *
   * class ApiService {
   *   init() {
   *     // ...
   *   }
   * }
   *
   * const TOKENS = {
   *   apiServiceFactory: token<Factory<ApiService>>('Factory<ApiService>'),
   * };
   *
   * const container = new Container();
   *
   * container
   *   .bind(TOKENS.apiServiceFactory)
   *   .toFactory(ApiService, (instance) => instance.init());
   *
   * const apiServiceFactory = container.get(TOKENS.apiServiceFactory);
   *
   * // Creates an instance and then call the initializer, if there is one.
   * const apiService = apiServiceFactory();
   *
   * console.log(apiService instanceof ApiService); // → true
   *
   *
   * @example
   * <caption>Example usage of factory with arguments.</caption>
   *
   * import { Container, Factory, token } from 'brandi';
   *
   * class ApiService {
   *   init(key: string) {
   *     // ...
   *   }
   * }
   *
   * const TOKENS = {
   *   apiServiceFactory: token<Factory<ApiService, [key: string]>>('Factory<ApiService>'),
   * };
   *
   * const container = new Container();
   *
   * container
   *   .bind(TOKENS.apiServiceFactory)
   *   .toFactory(ApiService, (instance, key) => instance.init(key));
   *
   * const apiServiceFactory = container.get(TOKENS.apiServiceFactory);
   *
   * // Creates an instance and then call the initializer, if there is one.
   * const apiService = apiServiceFactory('#key9428');
   *
   * console.log(apiService instanceof ApiService); // → true
   *
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
   *
   * @example
   * <caption>Example usage of instance binding.</caption>
   *
   * import { Container, token } from 'brandi';
   *
   * class ApiService {}
   *
   * const TOKENS = {
   *   apiService: token<ApiService>('apiService'),
   * };
   *
   * const container = new Container();
   *
   * container
   *   .bind(TOKENS.apiService)
   *   .toInstance(ApiService)
   *   .inTransientScope();
   *
   * const apiService = container.get(TOKENS.apiService);
   *
   * console.log(apiService instanceof ApiService); // → true
   *
   *
   * @link https://brandi.js.org/reference/binding-types#toinstancecreator
   */
  public toInstance(creator: UnknownCreator<Dependency>): ScopeSyntax {
    return new ScopeSyntax(this.vault, creator, this.token, this.condition);
  }
}
