---
id: use-injection
title: useInjection
sidebar_label: useInjection
hide_title: true
---

# `useInjection`

The `useInjection(token)` hook allows you to get a dependency
from a container provided through [`ContainerProvider`](./container-provider.md).

## Arguments

1. `token`: [`Token`](../reference/pointers-and-registrators.md#tokentdescription).

## Returns

`TokenType<Token>` — a dependency bound to the token.

## Example

```tsx
import { useInjection } from 'brandi-react';
import { FunctionComponent } from 'react';

import { TOKENS } from '../tokens';

export const UserComponent: FunctionComponent = () => {
  const userService = useInjection(TOKENS.userService);

  /* ... */

  return (/* ... */);
}
```

The binding of `TOKENS.userService` was shown
in [the example](./container-provider.md#providing-a-modules-own-container) in `ContainerProvider` section.
