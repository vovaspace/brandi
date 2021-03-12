import { Tag, Token, TokenType } from '../pointers';
import { UnknownConstructor, UnknownFunction } from '../types';
import { injectsRegistry, tagsRegistry } from '../globals';

import {
  Binding,
  CreatorBinding,
  FunctionCreatorBinding,
  isConstructorCreatorBinding,
  isCreatorBinding,
  isCreatorContainerScopedBinding,
  isCreatorResolutionScopedBinding,
  isCreatorSingletonScopedBinding,
  isFactoryBinding,
} from './bindings';
import { BindingTokenSyntax, BindingTypeSyntax } from './syntax';
import { BindingsRegistry } from './BindingsRegistry';
import { ContainerSnapshot } from './ContainerSnapshot';
import { ResolutionContext } from './ResolutionContext';

export class Container {
  private registry = new BindingsRegistry();

  private snapshot: ContainerSnapshot | null = null;

  constructor(public parent?: Container) {}

  public clone(): Container {
    const newContainer = new Container(this.parent);
    newContainer.registry = this.registry.clone();
    return newContainer;
  }

  public capture(): void {
    this.snapshot = new ContainerSnapshot(this.registry);
  }

  public restore(): void {
    if (this.snapshot !== null) {
      this.registry = this.snapshot.pick();
    } else if (process.env.NODE_ENV === 'development') {
      console.error(
        "Error: It looks like a trying to restore a non-captured container state. Did you forget to call 'capture()' method?",
      );
    }
  }

  public bind<T extends Token>(token: T): BindingTypeSyntax<TokenType<T>> {
    return new BindingTokenSyntax(this.registry).bind(token);
  }

  public when(tag: Tag): BindingTokenSyntax {
    return new BindingTokenSyntax(this.registry, tag);
  }

  public get<T extends Token>(token: T): TokenType<T> {
    return this.getSingle(token) as TokenType<T>;
  }

  private getSingle(
    token: Token,
    context: ResolutionContext = new ResolutionContext(),
    tags?: Tag[],
  ): unknown {
    const binding = this.resolveBinding(token, tags);
    return this.resolveValue(binding, context);
  }

  private getMultiple(
    tokens: Token[],
    context: ResolutionContext,
    tags?: Tag[],
  ): unknown[] {
    return tokens.map((token) => this.getSingle(token, context, tags));
  }

  private resolveBinding(token: Token, tags?: Tag[]): Binding {
    const binding = this.registry.get(token, tags);

    if (binding !== undefined) return binding;
    if (this.parent !== undefined) return this.parent.resolveBinding(token);

    throw new Error(
      `No matching bindings found for '${token.description}' token.`,
    );
  }

  private resolveValue(binding: Binding, context: ResolutionContext): unknown {
    if (isCreatorBinding(binding)) {
      if (isCreatorSingletonScopedBinding(binding)) {
        if (binding.hasCached) return binding.cache;

        const result = this.resolveCreator(binding, context);
        binding.setCache(result);
        return result;
      }

      if (isCreatorContainerScopedBinding(binding)) {
        if (binding.cache.has(this)) return binding.cache.get(this);

        const result = this.resolveCreator(binding, context);
        binding.cache.set(this, result);
        return result;
      }

      if (isCreatorResolutionScopedBinding(binding)) {
        if (context.cache.has(binding)) return context.cache.get(binding);

        const result = this.resolveCreator(binding, context);
        context.cache.set(binding, result);
        return result;
      }

      return this.resolveCreator(binding, context);
    }

    if (isFactoryBinding(binding)) {
      return (...args: unknown[]) => {
        const instance = this.construct(binding.value.ctor, context);

        if (binding.value.initializer)
          binding.value.initializer(instance, ...args);

        return instance;
      };
    }

    return binding.value;
  }

  private resolveCreator(
    binding: CreatorBinding,
    context: ResolutionContext,
  ): unknown {
    if (isConstructorCreatorBinding(binding))
      return this.construct(binding.value, context);

    return this.call((binding as FunctionCreatorBinding).value, context);
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
