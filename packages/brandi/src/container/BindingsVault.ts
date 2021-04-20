import { ResolutionCondition, UnknownCreator } from '../types';
import { Token, TokenValue, tag as createTag } from '../pointers';

import { Binding } from './bindings';

export class BindingsVault {
  private static notag = createTag('notag');

  private readonly map = new Map<symbol, Map<ResolutionCondition, Binding>>();

  public set(
    binding: Binding,
    token: Token,
    condition: ResolutionCondition = BindingsVault.notag,
  ): void {
    const current = this.map.get(token.__symbol);

    if (current === undefined) {
      this.map.set(
        token.__symbol,
        new Map<ResolutionCondition, Binding>().set(condition, binding),
      );
    } else {
      current.set(condition, binding);
    }
  }

  public get(
    token: TokenValue,
    conditions: ResolutionCondition[] = [],
    target?: UnknownCreator,
  ): Binding | undefined {
    const bindings = this.map.get(token.__symbol);

    if (bindings === undefined) return undefined;

    if (target !== undefined) {
      const targetBinding = bindings.get(target);
      if (targetBinding) return targetBinding;
    }

    if (
      process.env.NODE_ENV !== 'production' &&
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

    for (let i = 0, len = conditions.length; i < len; i += 1) {
      const binding = bindings.get(conditions[i]!);
      if (binding) return binding;
    }

    return bindings.get(BindingsVault.notag);
  }

  public clone(): BindingsVault {
    const newBindingsVault = new BindingsVault();

    this.map.forEach((value, key) => {
      newBindingsVault.map.set(
        key,
        new Map<ResolutionCondition, Binding>(value),
      );
    });

    return newBindingsVault;
  }
}
