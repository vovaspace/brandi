import { Tag, Token, TokenType } from '../pointers';
import { injectsRegistry, tagsRegistry } from '../globals';
import { Constructor } from '../types';

import {
  Binding,
  InstanceTransientBinding,
  isFactoryBinding,
  isInstanceBinding,
  isInstanceContainerBinding,
  isInstanceResolutionBinding,
  isInstanceSingletonBinding,
} from './Binding';
import { BindingTypeSyntax } from './BindingTypeSyntax';
import { BindingsRegistry } from './BindingsRegistry';
import { ResolutionContext } from './ResolutionContext';

export class Container {
  private readonly bindingsRegistry = new BindingsRegistry();

  constructor(public parent?: Container) {}

  public bind<T extends Token>(token: T) {
    return new BindingTypeSyntax<TokenType<T>>(this.bindingsRegistry, token);
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
    context: ResolutionContext = new ResolutionContext(),
    tags?: Tag[],
  ) {
    return tokens.map((token) => this.getSingle(token, context, tags));
  }

  private resolveBinding(token: Token, tags?: Tag[]): Binding {
    const binding = this.bindingsRegistry.get(token, tags);

    if (binding) return binding;
    if (this.parent) return this.parent.resolveBinding(token);

    throw new Error();
  }

  private resolveValue(binding: Binding, context: ResolutionContext) {
    if (isInstanceBinding(binding)) {
      if (isInstanceSingletonBinding(binding)) {
        // eslint-disable-next-line no-param-reassign
        binding.instance = binding.instance || this.construct(binding.value, context);
        return binding.instance;
      }

      if (isInstanceContainerBinding(binding)) {
        const instance = binding.instances.get(this) || this.construct(binding.value, context);
        binding.instances.set(this, instance);
        return instance;
      }

      if (isInstanceResolutionBinding(binding)) {
        const instance = context.instances.get(binding) || this.construct(binding.value, context);
        context.instances.set(binding, instance);
        return instance;
      }

      return this.construct((binding as InstanceTransientBinding).value, context);
    }

    if (isFactoryBinding(binding)) {
      return () => this.construct(binding.value, context);
    }

    // ValueBinding
    return binding.value;
  }

  private construct(Ctor: Constructor, context: ResolutionContext): Object {
    if (Ctor.length === 0) {
      return new Ctor();
    }

    const injects = injectsRegistry.get(Ctor);
    if (!injects) throw new Error();

    const tags = tagsRegistry.get(Ctor);
    const params = this.getMultiple(injects, context, tags);

    return new Ctor(...params);
  }
}
