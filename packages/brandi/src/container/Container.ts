import { Tag, Token, TokenType } from '../pointers';
import { UnknownConstructor, UnknownFunction } from '../types';
import { injectsRegistry, tagsRegistry } from '../globals';

import {
  Binding,
  EntityBinding,
  EntityFunctionBinding,
  FactoryFunctionBinding,
  isEntityBinding,
  isEntityConstructorBinding,
  isEntityContainerScopedBinding,
  isEntityResolutionScopedBinding,
  isEntitySingletonScopedBinding,
  isFactoryBinding,
  isFactoryConstructorBinding,
} from './bindings';
import { TokenSyntax, TypeSyntax } from './syntax';
import { BindingsVault } from './BindingsVault';
import { ResolutionContext } from './ResolutionContext';

export class Container {
  private vault = new BindingsVault();

  private snapshot: Container | null = null;

  constructor(public parent?: Container) {}

  public clone(): Container {
    const newContainer = new Container(this.parent);
    newContainer.vault = this.vault.clone();
    return newContainer;
  }

  public capture(): void {
    this.snapshot = this.clone();
  }

  public restore(): void {
    if (this.snapshot !== null) {
      this.vault = this.snapshot.vault.clone();
    } else if (process.env.NODE_ENV !== 'production') {
      console.error(
        "Error: It looks like a trying to restore a non-captured container state. Did you forget to call 'capture()' method?",
      );
    }
  }

  public bind<T extends Token>(token: T): TypeSyntax<TokenType<T>> {
    return new TokenSyntax(this.vault).bind(token);
  }

  public when(tag: Tag): TokenSyntax {
    return new TokenSyntax(this.vault, tag);
  }

  public get<T extends Token>(token: T): TokenType<T>;

  /**
   * @access package
   *
   * @deprecated `tags` argument is added for internal use.
   *              We do not guarantee that this API will be preserved in future versions.
   *
   */
  public get<T extends Token>(token: T, tags: Tag[]): TokenType<T>;

  public get<T extends Token>(token: T, tags?: Tag[]): TokenType<T> {
    return this.getSingle(token, tags) as TokenType<T>;
  }

  private getSingle(
    token: Token,
    tags?: Tag[],
    context: ResolutionContext = new ResolutionContext(),
  ): unknown {
    const binding = this.resolveBinding(token, tags);
    return this.resolveValue(binding, context);
  }

  private getMultiple(
    tokens: Token[],
    context: ResolutionContext,
    tags?: Tag[],
  ): unknown[] {
    return tokens.map((token) => this.getSingle(token, tags, context));
  }

  private resolveBinding(token: Token, tags?: Tag[]): Binding {
    const binding = this.vault.get(token, tags);

    if (binding !== undefined) return binding;
    if (this.parent !== undefined) return this.parent.resolveBinding(token);

    throw new Error(
      `No matching bindings found for '${token.description}' token.`,
    );
  }

  private resolveValue(binding: Binding, context: ResolutionContext): unknown {
    if (isEntityBinding(binding)) {
      if (isEntitySingletonScopedBinding(binding)) {
        if (binding.hasCached) return binding.cache;

        const entity = this.resolveCreator(binding, context);
        binding.setCache(entity);
        return entity;
      }

      if (isEntityContainerScopedBinding(binding)) {
        if (binding.cache.has(this)) return binding.cache.get(this);

        const entity = this.resolveCreator(binding, context);
        binding.cache.set(this, entity);
        return entity;
      }

      if (isEntityResolutionScopedBinding(binding)) {
        if (context.cache.has(binding)) return context.cache.get(binding);

        const entity = this.resolveCreator(binding, context);
        context.cache.set(binding, entity);
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
    target: UnknownConstructor | UnknownFunction,
    context: ResolutionContext,
  ): unknown[] {
    const injects = injectsRegistry.get(target);

    if (!injects)
      throw new Error(
        `Missing required 'injected' registration of '${target.name}'`,
      );

    const tags = tagsRegistry.get(target);
    return this.getMultiple(injects, context, tags);
  }

  private call(func: UnknownFunction, context: ResolutionContext): unknown {
    if (func.length === 0) return func();

    const parameters = this.resolveParameters(func, context);

    return func(...parameters);
  }

  private construct(
    Ctor: UnknownConstructor,
    context: ResolutionContext,
  ): Object {
    if (Ctor.length === 0) return new Ctor();

    const parameters = this.resolveParameters(Ctor, context);

    return new Ctor(...parameters);
  }
}
