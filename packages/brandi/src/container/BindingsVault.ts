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
    const current = this.map.get(token.__symbol);

    if (current === undefined) {
      this.map.set(
        token.__symbol,
        new Map<ResolutionCondition, Binding | BindingsVault>().set(
          condition,
          binding,
        ),
      );
    } else {
      current.set(condition, binding);
    }
  }

  private get(
    token: TokenValue,
    conditions?: ResolutionCondition[],
    target?: UnknownCreator,
  ): Binding | BindingsVault | undefined {
    const bindings = this.map.get(token.__symbol);

    if (bindings === undefined) return undefined;

    if (target !== undefined) {
      const targetBinding = bindings.get(target);
      if (targetBinding) return targetBinding;
    }

    if (
      process.env.NODE_ENV !== 'production' &&
      conditions !== undefined &&
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
          `When resolving a binding by '${token.__symbol.description}' token with [${conditionsDisplayString}] conditions, ` +
          'more than one binding was found. ' +
          "In this case, Brandi resolves the binding by the first tag assigned by 'tagged(target, ...tags)' function " +
          "or, if you explicitly passed conditions through 'Container.get(token, conditions)' method, " +
          'by the first resolved condition. ' +
          'Try to avoid such implicit logic.',
      );
    }

    if (conditions !== undefined) {
      for (let i = 0, len = conditions.length; i < len; i += 1) {
        const binding = bindings.get(conditions[i]!);
        if (binding !== undefined) return binding;
      }
    }

    return bindings.get(BindingsVault.notag);
  }

  private resolveOwn(
    token: TokenValue,
    cache: ResolutionCache,
    conditions?: ResolutionCondition[],
    target?: UnknownCreator,
  ): Binding | undefined {
    const binding = this.get(token, conditions, target);

    if (binding !== undefined) {
      if (binding instanceof BindingsVault) {
        cache.vaults.push(binding);
        return binding.resolveOwn(token, cache, conditions, target);
      }

      return binding;
    }

    return this.parent === null
      ? undefined
      : this.parent.resolveOwn(token, cache, conditions, target);
  }

  public resolve(
    token: TokenValue,
    cache: ResolutionCache,
    conditions?: ResolutionCondition[],
    target?: UnknownCreator,
  ): Binding | undefined {
    const ownBinding = this.resolveOwn(token, cache, conditions, target);

    if (ownBinding !== undefined) return ownBinding;

    const { vaults } = cache;
    for (let i = 0, len = vaults.length; i < len; i += 1) {
      const cacheBinding = vaults[i]!.resolveOwn(
        token,
        cache,
        conditions,
        target,
      );

      if (cacheBinding !== undefined) return cacheBinding;
    }

    return undefined;
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
