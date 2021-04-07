---
id: create-injection-hooks
title: createInjectionHooks
sidebar_label: createInjectionHooks
hide_title: true
---

# `createInjectionHooks`

The `createInjectionHooks(...tokens)` creates hooks for getting dependencies more easily.

## Arguments

1. `...tokens`: [`Token[]`](../reference/pointers-and-registrators.md#tokentdescription).

## Returns

`(() => TokenType<Token>)[]` — an array of hooks for getting dependencies.

## Example

<!-- prettier-ignore-start -->
```typescript title="hooks.ts"
import { createInjectionHooks } from 'brandi-react';

import { TOKENS } from './tokens';

const [
  useApiService,
  useUserService,
  useAuthService,
] = createInjectionHooks(
  TOKENS.apiService,
  TOKENS.userService,
  TOKENS.authService,
);

export { useApiService, useUserService, useAuthService };
```
<!-- prettier-ignore-end -->

```tsx title="UserComponent.tsx"
import { FunctionComponent } from 'react';

import { useUserService } from './hooks';

export const UserComponent: FunctionComponent = () => {
  const userService = useUserService();

  /* ... */

  return (/* ... */);
}
```

This `UserComponent` is the same as `UserComponent`
in [the example](./use-injection.md#example) in `useInjection` section.
