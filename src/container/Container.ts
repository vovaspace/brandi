import { Tag, Token, TokenType } from '../pointers';
import { injectsRegistry, tagsRegistry } from '../globals';
import { BindingTokenSyntax } from './syntax';
import { Constructor } from '../types';

import {
  Binding,
  isContainerScopedInstanceBinding,
  isFactoryBinding,
  isInstanceBinding,
  isResolutionScopedInstanceBinding,
  isSingletonScopedInstanceBinding,
} from './bindings';
import { BindingsRegistry } from './BindingsRegistry';
import { ResolutionContext } from './ResolutionContext';

export class Container {
  private registry = new BindingsRegistry();

  constructor(public parent?: Container) {}

  public copy(): Container {
    const newContainer = new Container(this.parent);
    newContainer.registry = this.registry.copy();
    return newContainer;
  }

  public bind<T extends Token>(token: T) {
    return new BindingTokenSyntax(this.registry).bind(token);
  }

  public when(tag: Tag) {
    return new BindingTokenSyntax(this.registry, tag);
  }

  public get<T extends Token>(token: T): TokenType<T> {
    return this.getSingle(token) as TokenType<T>;
  }

  private getSingle(
    token: Token,
    context: ResolutionContext = new ResolutionContext(),
    tags?: Tag[],
  ) {
    const binding = this.resolveBinding(token, tags);
    return this.resolveValue(binding, context);
  }

  private getMultiple(
    tokens: Token[],
    context: ResolutionContext,
    tags?: Tag[],
  ) {
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

  private resolveValue(binding: Binding, context: ResolutionContext) {
    if (isInstanceBinding(binding)) {
      if (isSingletonScopedInstanceBinding(binding)) {
        // eslint-disable-next-line no-param-reassign
        binding.instance =
          binding.instance ?? this.construct(binding.value, context);

        return binding.instance;
      }

      if (isContainerScopedInstanceBinding(binding)) {
        const instance =
          binding.instances.get(this) ?? this.construct(binding.value, context);

        binding.instances.set(this, instance);

        return instance;
      }

      if (isResolutionScopedInstanceBinding(binding)) {
        const instance =
          context.instances.get(binding) ??
          this.construct(binding.value, context);

        context.instances.set(binding, instance);

        return instance;
      }

      return this.construct(binding.value, context);
    }

    if (isFactoryBinding(binding)) {
      return (...args: unknown[]) => {
        const instance = this.construct(binding.value.ctor, context);

        if (binding.value.transformer) {
          binding.value.transformer(instance, ...args);
        }

        return instance;
      };
    }

    return binding.value;
  }

  private construct(Ctor: Constructor, context: ResolutionContext): Object {
    if (Ctor.length === 0) {
      return new Ctor();
    }

    const injects = injectsRegistry.get(Ctor);

    if (!injects)
      throw new Error(
        `Missing required 'injected' registration in '${Ctor.name}'`,
      );

    const tags = tagsRegistry.get(Ctor);
    const params = this.getMultiple(injects, context, tags);

    return new Ctor(...params);
  }
}
