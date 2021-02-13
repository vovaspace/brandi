import { Tag, Token } from '../pointers';

import { Binding } from './Binding';

export class BindingsRegistry {
  private readonly map = new Map<Token, Binding[]>();

  public set(token: Token, binding: Binding) {
    const current = this.map.get(token) || [];
    current.unshift(binding);
    this.map.set(token, current);
  }

  public get(token: Token, tags: Tag[] | null = null): Binding | undefined {
    const bindings = this.map.get(token) || [];

    if (tags === null) return bindings.find((binding) => binding.tag === null);

    return (
      bindings.find((binding) => binding.tag !== null && tags.includes(binding.tag)) ||
      bindings.find((binding) => binding.tag === null)
    );
  }
}
