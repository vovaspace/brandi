import { Tag, Token } from '../pointers';
import { find, includes } from '../utils';

import { Binding } from './Binding';

export class BindingsRegistry {
  constructor(private readonly map: Map<Token, Binding[]> = new Map<Token, Binding[]>()) {}

  public push(binding: Binding, token: Token): void {
    const current = this.map.get(token);

    if (current === undefined) this.map.set(token, [binding]);
    else current.unshift(binding);
  }

  public get(token: Token, tags?: Tag[]): Binding | undefined {
    const bindings = this.map.get(token);

    if (bindings === undefined) return undefined;

    if (tags === undefined) return find(bindings, (binding) => binding.tag === undefined);

    return (
      find(bindings, (binding) => includes(tags, binding.tag)) ??
      find(bindings, (binding) => binding.tag === undefined)
    );
  }

  public copy(): BindingsRegistry {
    return new BindingsRegistry(new Map(this.map));
  }
}
