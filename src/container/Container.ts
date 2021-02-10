import { Token, TokenType } from '../token';
import { Constructor } from '../types';
import { typesRegistry } from '../typesRegistry';

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
  private readonly bindingsRegistry: BindingsRegistry = new Map<Token, Binding>();

  constructor(public parent?: Container) {}

  public bind<T extends Token>(token: T) {
    return new BindingTypeSyntax<TokenType<T>>(this.bindingsRegistry, token);
  }

  public get<T extends Token>(
    token: T,
    context: ResolutionContext = new ResolutionContext(),
  ): TokenType<T> {
    const binding = this.resolveBinding(token);
    return this.resolveValue(token, binding, context);
  }

  public getAll<T extends Token[]>(
    tokens: T,
    context: ResolutionContext = new ResolutionContext(),
  ) {
    return tokens.map((token) => this.get(token, context));
  }

  private resolveBinding(token: Token): Binding {
    const binding = this.bindingsRegistry.get(token);

    if (binding) return binding;
    if (this.parent) return this.parent.resolveBinding(token);

    throw new Error();
  }

  private resolveValue(token: Token, binding: Binding, context: ResolutionContext) {
    if (isInstanceBinding(binding)) {
      if (isInstanceSingletonBinding(binding)) {
        // eslint-disable-next-line no-param-reassign
        binding.instance ||= this.construct(binding.value);
        return binding.instance;
      }

      if (isInstanceContainerBinding(binding)) {
        const instance = binding.instances.get(this) || this.construct(binding.value);
        binding.instances.set(this, instance);
        return instance;
      }

      if (isInstanceResolutionBinding(binding)) {
        const instance = context.instances.get(token) || this.construct(binding.value);
        context.instances.set(token, instance);
        return instance;
      }

      return this.construct((binding as InstanceTransientBinding).value);
    }

    if (isFactoryBinding(binding)) {
      return () => this.construct(binding.value);
    }

    // ValueBinding
    return binding.value;
  }

  private construct(Ctor: Constructor): Object {
    if (Ctor.length === 0) {
      return new Ctor();
    }

    const paramInfo = typesRegistry.get(Ctor);
    if (!paramInfo) throw new Error();

    const params = this.getAll(paramInfo);
    return new Ctor(...params);
  }
}
