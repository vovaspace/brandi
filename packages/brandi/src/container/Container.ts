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
import { WhenSyntax } from './syntax';

type ResolutionCache = Map<Binding, unknown>;

export class Container extends WhenSyntax {
  private snapshot: BindingsVault | null = null;

  constructor(public parent?: Container) {
    super(new BindingsVault());
  }

  public clone(): Container {
    const newContainer = new Container(this.parent);
    newContainer.vault = this.vault.clone();
    return newContainer;
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
    return this.getSingle(token, conditions) as TokenType<T>;
  }

  private getSingle(
    token: TokenValue,
    conditions?: ResolutionCondition[],
    target?: UnknownCreator,
    cache: ResolutionCache = new Map<Binding, unknown>(),
  ): unknown {
    const binding = this.resolveBinding(token, conditions, target);

    if (binding === null) return undefined;

    return this.resolveValue(binding, cache);
  }

  private getMultiple(
    tokens: TokenValue[],
    cache: ResolutionCache,
    conditions?: ResolutionCondition[],
    target?: UnknownCreator,
  ): unknown[] {
    return tokens.map((token) =>
      this.getSingle(token, conditions, target, cache),
    );
  }

  private resolveBinding(
    token: TokenValue,
    conditions?: ResolutionCondition[],
    target?: UnknownCreator,
  ): Binding | null {
    const binding = this.vault.get(token, conditions, target);

    if (binding !== undefined) return binding;
    if (this.parent !== undefined)
      return this.parent.resolveBinding(token, conditions, target);

    if (token.__isOptional) return null;

    throw new Error(
      `No matching bindings found for '${token.__symbol.description}' token.`,
    );
  }

  private resolveValue(binding: Binding, cache: ResolutionCache): unknown {
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
          () => cache.get(binding),
          (instance) => {
            cache.set(binding, instance);
          },
        );
      }

      return this.resolveInstance(binding.value, cache);
    }

    if (isFactoryBinding(binding)) {
      return (...args: unknown[]) => {
        const instance = this.resolveInstance(binding.value.creator, cache);

        if (binding.value.initializer)
          binding.value.initializer(instance, ...args);

        return instance;
      };
    }

    return binding.value;
  }

  private resolveInstanceCache(
    binding: InstanceBinding,
    cache: ResolutionCache,
    getCache: () => unknown,
    setCache: (instance: unknown) => void,
  ) {
    const instanceCache = getCache();

    if (instanceCache !== undefined) return instanceCache;

    const instance = this.resolveInstance(binding.value, cache);
    setCache(instance);
    return instance;
  }

  private resolveInstance(
    creator: UnknownCreator,
    cache: ResolutionCache,
  ): unknown {
    const parameters = this.resolveParameters(creator, cache);
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

  private resolveParameters(
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

    return this.getMultiple(injects, cache, tagsRegistry.get(target), target);
  }
}
