import { ResolutionCondition, UnknownCreator } from '../types';
import { TokenType, TokenValue } from '../pointers';
import { callableRegistry, injectsRegistry, tagsRegistry } from '../registries';

import {
  Binding,
  FactoryInitializer,
  InstanceBinding,
  isFactoryBinding,
  isInstanceBinding,
  isInstanceContainerScopedBinding,
  isInstanceResolutionScopedBinding,
  isInstanceSingletonScopedBinding,
} from './bindings';
import { BindingsVault } from './BindingsVault';
import { DependencyModule } from './DependencyModule';
import { ResolutionCache } from './ResolutionCache';

export class Container extends DependencyModule {
  private snapshot: BindingsVault | null = null;

  /**
   * @description
   * Captures (snapshots) the current container state.
   *
   * @link https://brandi.js.org/reference/container#capture
   */
  public capture?(): void;

  /**
   * @description
   * Restores the captured container state.
   *
   * @link https://brandi.js.org/reference/container#restore
   */
  public restore?(): void;

  constructor() {
    super();

    if (process.env.NODE_ENV !== 'production') {
      this.capture = (): void => {
        this.snapshot = this.vault.copy!();
      };

      this.restore = (): void => {
        if (this.snapshot) {
          this.vault = this.snapshot.copy!();
        } else {
          console.error(
            "Error: It looks like a trying to restore a non-captured container state. Did you forget to call 'capture()' method?",
          );
        }
      };
    }
  }

  /**
   * @description
   * Sets the parent container.
   *
   * @param container - a `Container` or `null` that will be set as the parent container.
   * @returns `this`.
   *
   * @link https://brandi.js.org/reference/container#extendcontainer
   */
  public extend(container: Container | null): this {
    this.vault.parent = container === null ? null : container.vault;
    return this;
  }

  /**
   * @description
   * Creates an unlinked clone of the container.
   *
   * @returns `Container`.
   *
   * @link https://brandi.js.org/reference/container#clone
   */
  public clone(): Container {
    const container = new Container();
    container.vault = this.vault.clone();
    return container;
  }

  /**
   * @description
   * Gets a dependency bound to the token.
   *
   * @param token - token for which a dependence will be got.
   * @returns `TokenType<TokenValue>`.
   *
   * @link https://brandi.js.org/reference/container#gettoken
   */
  public get<T extends TokenValue>(token: T): TokenType<T>;

  /**
   * @access package
   * @deprecated
   * `conditions` argument is added for internal use.
   * Use it if you really understand that it is necessary.
   */
  public get<T extends TokenValue>(
    token: T,
    conditions: ResolutionCondition[],
  ): TokenType<T>;

  public get<T extends TokenValue>(
    token: T,
    conditions?: ResolutionCondition[],
  ): TokenType<T> {
    return this.resolveToken(token, conditions) as TokenType<T>;
  }

  private resolveTokens(
    tokens: TokenValue[],
    cache: ResolutionCache,
    conditions?: ResolutionCondition[],
    target?: UnknownCreator,
  ): unknown[] {
    return tokens.map((token) =>
      this.resolveToken(token, conditions, target, cache.split()),
    );
  }

  private resolveToken(
    token: TokenValue,
    conditions?: ResolutionCondition[],
    target?: UnknownCreator,
    cache: ResolutionCache = new ResolutionCache(),
  ): unknown {
    const binding = this.vault.get(token, cache, conditions, target);

    if (binding) {
      try {
        return this.resolveBinding(binding, cache);
      } catch (e) {
        throw new Error(`Failed to resolve the binding for '${token.__d}' token.`)
      }
    }
    if (token.__o) return undefined;

    throw new Error(`No matching bindings found for '${token.__d}' token.`);
  }

  private resolveBinding(binding: Binding, cache: ResolutionCache): unknown {
    if (isInstanceBinding(binding)) {
      if (isInstanceSingletonScopedBinding(binding)) {
        return this.resolveCache(
          binding,
          cache,
          () => binding.cache,
          (instance) => {
            // eslint-disable-next-line no-param-reassign
            binding.cache = instance;
          },
        );
      }

      if (isInstanceContainerScopedBinding(binding)) {
        return this.resolveCache(
          binding,
          cache,
          () => binding.cache.get(this.vault),
          (instance) => {
            binding.cache.set(this.vault, instance);
          },
        );
      }

      if (isInstanceResolutionScopedBinding(binding)) {
        return this.resolveCache(
          binding,
          cache,
          () => cache.instances.get(binding),
          (instance) => {
            cache.instances.set(binding, instance);
          },
        );
      }

      return this.createInstance(binding.impl, cache);
    }

    if (isFactoryBinding(binding)) {
      return (...args: unknown[]) => {
        const instance = this.createInstance(binding.impl.creator, cache);

        return instance instanceof Promise
          ? instance.then((i) =>
              Container.resolveInitialization(
                i,
                args,
                binding.impl.initializer,
              ),
            )
          : Container.resolveInitialization(
              instance,
              args,
              binding.impl.initializer,
            );
      };
    }

    return binding.impl;
  }

  private resolveCache(
    binding: InstanceBinding,
    cache: ResolutionCache,
    getCache: () => unknown,
    setCache: (instance: unknown) => void,
  ) {
    const instanceCache = getCache();

    if (instanceCache !== undefined) return instanceCache;

    const instance = this.createInstance(binding.impl, cache);
    setCache(instance);
    return instance;
  }

  private createInstance(
    creator: UnknownCreator,
    cache: ResolutionCache,
  ): unknown {
    const parameters = this.getParameters(creator, cache);
    const isCallable = callableRegistry.get(creator);

    if (isCallable !== undefined) {
      return isCallable
        ? // @ts-expect-error: This expression is not callable.
          creator(...parameters)
        : // @ts-expect-error: This expression is not constructable.
          // eslint-disable-next-line new-cap
          new creator(...parameters);
    }

    try {
      // @ts-expect-error: This expression is not callable.
      const instance = creator(...parameters);
      callableRegistry.set(creator, true);
      return instance;
    } catch {
      // @ts-expect-error: This expression is not constructable.
      // eslint-disable-next-line new-cap
      const instance = new creator(...parameters);
      callableRegistry.set(creator, false);
      return instance;
    }
  }

  private getParameters(
    target: UnknownCreator,
    cache: ResolutionCache,
  ): unknown[] {
    const injects = injectsRegistry.get(target);

    if (injects)
      return this.resolveTokens(
        injects,
        cache,
        tagsRegistry.get(target),
        target,
      );

    if (target.length === 0) return [];

    throw new Error(
      `Missing required 'injected' registration of '${target.name}'`,
    );
  }

  private static resolveInitialization<T>(
    instance: T,
    args: unknown[],
    initializer?: FactoryInitializer,
  ) {
    const initialization = initializer?.(instance, ...args);
    return initialization instanceof Promise
      ? initialization.then(() => instance)
      : instance;
  }
}
