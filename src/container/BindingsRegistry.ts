import { Tag, Token, tag as createTag } from '../pointers';

import { Binding } from './bindings';

export class BindingsRegistry {
  private static notag = createTag('notag');

  private readonly map = new Map<Token, Map<Tag, Binding>>();

  public set(
    binding: Binding,
    token: Token,
    tag: Tag = BindingsRegistry.notag,
  ): void {
    const current = this.map.get(token);

    if (current === undefined) {
      this.map.set(token, new Map<Tag, Binding>().set(tag, binding));
    } else {
      current.set(tag, binding);
    }
  }

  public get(token: Token, tags?: Tag[]): Binding | undefined {
    const bindings = this.map.get(token);

    if (bindings === undefined) return undefined;
    if (tags === undefined) return bindings.get(BindingsRegistry.notag);

    for (let i = 0, len = tags.length; i < len; i += 1) {
      const binding = bindings.get(tags[i]!);
      if (binding) return binding;
    }

    return bindings.get(BindingsRegistry.notag);
  }

  public clone(): BindingsRegistry {
    const newBindingsRegistry = new BindingsRegistry();

    this.map.forEach((value, key) => {
      newBindingsRegistry.map.set(key, new Map<Tag, Binding>(value));
    });

    return newBindingsRegistry;
  }
}
