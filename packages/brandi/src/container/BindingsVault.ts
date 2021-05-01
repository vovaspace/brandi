import { ResolutionCondition, UnknownCreator } from '../types';
import { Token, TokenValue, tag as createTag } from '../pointers';

import { Binding } from './bindings';
import { ResolutionCache } from './ResolutionCache';

export class BindingsVault {
  private static notag = createTag('NO_TAG');

  public parent: BindingsVault | null = null;

  private readonly map = new Map<
    symbol,
    Map<ResolutionCondition, Binding | BindingsVault>
  >();

  public set(
    binding: Binding | BindingsVault,
    token: Token,
    condition: ResolutionCondition = BindingsVault.notag,
  ): void {
    const current = this.map.get(token.__s);

    if (current) current.set(condition, binding);
    else
      this.map.set(
        token.__s,
        new Map<ResolutionCondition, Binding | BindingsVault>().set(
          condition,
          binding,
        ),
      );
  }

  private find(
    token: TokenValue,
    conditions?: ResolutionCondition[],
    target?: UnknownCreator,
  ): Binding | BindingsVault | undefined {
    const bindings = this.map.get(token.__s);

    if (bindings === undefined) return undefined;

    if (target) {
      const targetBinding = bindings.get(target);
      if (targetBinding) return targetBinding;
    }

    if (
      process.env.NODE_ENV !== 'production' &&
      conditions &&
      conditions.reduce(
        (acc, condition) => (bindings.has(condition) ? acc + 1 : acc),
        0,
      ) > 1
    ) {
      const conditionsDisplayString = conditions
        .map((condition) =>
          typeof condition === 'function'
            ? condition.name
            : `tag(${condition.description})`,
        )
        .join(', ');

      console.warn(
        'Warning: ' +
          `When resolving a binding by '${token.__d}' token with [${conditionsDisplayString}] conditions, ` +
          'more than one binding was found. ' +
          "In this case, Brandi resolves the binding by the first tag assigned by 'tagged(target, ...tags)' function " +
          "or, if you explicitly passed conditions through 'Container.get(token, conditions)' method, " +
          'by the first resolved condition. ' +
          'Try to avoid such implicit logic.',
      );
    }

    if (conditions) {
      for (let i = 0, len = conditions.length; i < len; i += 1) {
        const binding = bindings.get(conditions[i]!);
        if (binding) return binding;
      }
    }

    return bindings.get(BindingsVault.notag);
  }

  private resolve(
    token: TokenValue,
    cache: ResolutionCache,
    conditions?: ResolutionCondition[],
    target?: UnknownCreator,
  ): Binding | null {
    const binding = this.find(token, conditions, target);

    if (binding === undefined)
      return this.parent
        ? this.parent.resolve(token, cache, conditions, target)
        : null;

    if (binding instanceof BindingsVault) {
      cache.vaults.push(binding);
      return binding.resolve(token, cache, conditions, target);
    }

    return binding;
  }

  public get(
    token: TokenValue,
    cache: ResolutionCache,
    conditions?: ResolutionCondition[],
    target?: UnknownCreator,
  ): Binding | null {
    const ownBinding = this.resolve(token, cache, conditions, target);

    if (ownBinding) return ownBinding;

    for (let i = 0, v = cache.vaults, len = v.length; i < len; i += 1) {
      const cacheBinding = v[i]!.resolve(token, cache, conditions, target);
      if (cacheBinding) return cacheBinding;
    }

    return null;
  }

  public clone(): BindingsVault {
    const vault = new BindingsVault();
    vault.parent = this.parent;

    this.map.forEach((value, key) => {
      vault.map.set(
        key,
        new Map<ResolutionCondition, Binding | BindingsVault>(value),
      );
    });

    return vault;
  }
}
