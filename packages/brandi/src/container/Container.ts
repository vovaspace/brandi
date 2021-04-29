import { ResolutionCondition, UnknownCreator } from '../types';
import { TokenType, TokenValue } from '../pointers';
import { callableRegistry, injectsRegistry, tagsRegistry } from '../registries';

import {
  Binding,
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

  public extend(container: Container | null): this {
    this.vault.parent = container === null ? null : container.vault;
    return this;
  }

  public clone(): Container {
    const container = new Container();
    container.vault = this.vault.clone();
    return container;
  }

  public capture(): void {
    this.snapshot = this.vault.clone();
  }

  public restore(): void {
    if (this.snapshot !== null) {
      this.vault = this.snapshot.clone();
    } else if (process.env.NODE_ENV !== 'production') {
      console.error(
        "Error: It looks like a trying to restore a non-captured container state. Did you forget to call 'capture()' method?",
      );
    }
  }

  public get<T extends TokenValue>(token: T): TokenType<T>;

  /**
   * @access package
   * @deprecated `conditions` argument is added for internal use.
   *              Use it if you really understand that it is necessary.
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
    const binding = this.vault.resolve(token, cache, conditions, target);

    if (binding !== undefined) return this.resolveBinding(binding, cache);
    if (token.__isOptional) return undefined;

    throw new Error(
      `No matching bindings found for '${token.__symbol.description}' token.`,
    );
  }

  private resolveBinding(binding: Binding, cache: ResolutionCache): unknown {
    if (isInstanceBinding(binding)) {
      if (isInstanceSingletonScopedBinding(binding)) {
        return this.resolveInstanceCache(
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
        return this.resolveInstanceCache(
          binding,
          cache,
          () => binding.cache.get(this),
          (instance) => {
            binding.cache.set(this, instance);
          },
        );
      }

      if (isInstanceResolutionScopedBinding(binding)) {
        return this.resolveInstanceCache(
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

        if (binding.impl.initializer)
          binding.impl.initializer(instance, ...args);

        return instance;
      };
    }

    return binding.impl;
  }

  private resolveInstanceCache(
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

    if (injects === undefined) {
      if (target.length === 0) return [];

      throw new Error(
        `Missing required 'injected' registration of '${target.name}'`,
      );
    }

    return this.resolveTokens(injects, cache, tagsRegistry.get(target), target);
  }
}
