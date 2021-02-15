import { Tag, Token } from '../pointers';

import { Binding } from './Binding';

export class BindingsRegistry {
  constructor(private readonly map: Map<Token, Binding[]> = new Map<Token, Binding[]>()) {}

  public set(token: Token, binding: Binding): void {
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

  public copy(): BindingsRegistry {
    return new BindingsRegistry(new Map(this.map));
  }
}
