import {
  ResolutionCondition,
  UnknownConstructor,
  UnknownCreator,
  UnknownFunction,
} from '../types';
import { Token, TokenType, TokenValue } from '../pointers';
import { entitiesRegistry, injectsRegistry, tagsRegistry } from '../globals';

import { BindSyntax, TypeSyntax } from './syntax';
import {
  Binding,
  EntityBinding,
  EntityFunctionBinding,
  FactoryFunctionBinding,
  isEntityBinding,
  isEntityConstructorBinding,
  isEntityContainerScopedBinding,
  isEntityGlobalScopedBinding,
  isEntityResolutionScopedBinding,
  isEntitySingletonScopedBinding,
  isFactoryBinding,
  isFactoryConstructorBinding,
} from './bindings';
import { BindingsVault } from './BindingsVault';
import { ResolutionContext } from './ResolutionContext';

export class Container {
  private vault = new BindingsVault();

  private snapshot: BindingsVault | null = null;

  constructor(public parent?: Container) {}

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

  public bind<T extends Token>(token: T): TypeSyntax<TokenType<T>> {
    return new BindSyntax(this.vault).bind(token);
  }

  public when(condition: ResolutionCondition): BindSyntax {
    return new BindSyntax(this.vault, condition);
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
    context: ResolutionContext = new ResolutionContext(),
  ): unknown {
    const binding = this.resolveBinding(token, conditions, target);

    if (binding === null) return undefined;

    return this.resolveValue(binding, context);
  }

  private getMultiple(
    tokens: TokenValue[],
    context: ResolutionContext,
    conditions?: ResolutionCondition[],
    target?: UnknownCreator,
  ): unknown[] {
    return tokens.map((token) =>
      this.getSingle(token, conditions, target, context),
    );
  }

  private resolveBinding(
    token: TokenValue,
    conditions?: ResolutionCondition[],
    target?: UnknownCreator,
  ): Binding | null {
    const binding = this.vault.get(token, conditions, target);

    if (binding !== undefined) return binding;
    if (this.parent !== undefined) return this.parent.resolveBinding(token);

    if (token.__isOptional) return null;

    throw new Error(
      `No matching bindings found for '${token.__symbol.description}' token.`,
    );
  }

  private resolveValue(binding: Binding, context: ResolutionContext): unknown {
    if (isEntityBinding(binding)) {
      if (isEntitySingletonScopedBinding(binding)) {
        if (binding.cache !== undefined) return binding.cache;

        const entity = this.resolveCreator(binding, context);
        // eslint-disable-next-line no-param-reassign
        binding.cache = entity;
        return entity;
      }

      if (isEntityContainerScopedBinding(binding)) {
        const cache = binding.cache.get(this);

        if (cache !== undefined) return cache;

        const entity = this.resolveCreator(binding, context);
        binding.cache.set(this, entity);
        return entity;
      }

      if (isEntityResolutionScopedBinding(binding)) {
        const cache = context.cache.get(binding);

        if (cache !== undefined) return cache;

        const entity = this.resolveCreator(binding, context);
        context.cache.set(binding, entity);
        return entity;
      }

      if (isEntityGlobalScopedBinding(binding)) {
        const cache = entitiesRegistry.get(binding.value);

        if (cache !== undefined) return cache;

        const entity = this.resolveCreator(binding, context);
        entitiesRegistry.set(binding.value, entity);
        return entity;
      }

      return this.resolveCreator(binding, context);
    }

    if (isFactoryBinding(binding)) {
      return (...args: unknown[]) => {
        const entity = isFactoryConstructorBinding(binding)
          ? this.construct(binding.value.creator, context)
          : this.call(
              (binding as FactoryFunctionBinding).value.creator,
              context,
            );

        if (binding.value.initializer)
          binding.value.initializer(entity, ...args);

        return entity;
      };
    }

    return binding.value;
  }

  private resolveCreator(
    binding: EntityBinding,
    context: ResolutionContext,
  ): unknown {
    if (isEntityConstructorBinding(binding))
      return this.construct(binding.value, context);

    return this.call((binding as EntityFunctionBinding).value, context);
  }

  private resolveParameters(
    target: UnknownCreator,
    context: ResolutionContext,
  ): unknown[] {
    const injects = injectsRegistry.get(target);

    if (injects === undefined) {
      if (target.length === 0) return [];

      throw new Error(
        `Missing required 'injected' registration of '${target.name}'`,
      );
    }

    const tags = tagsRegistry.get(target);
    return this.getMultiple(injects, context, tags, target);
  }

  private call(func: UnknownFunction, context: ResolutionContext): unknown {
    return func(...this.resolveParameters(func, context));
  }

  private construct(
    Ctor: UnknownConstructor,
    context: ResolutionContext,
  ): Object {
    return new Ctor(...this.resolveParameters(Ctor, context));
  }
}
