---
id: optional-dependencies
title: Optional Dependencies
sidebar_label: Optional Dependencies
---

You can declare an optional dependency using the standard TypeScript syntax:

```typescript title="ApiService.ts"
import { injected } from 'brandi';
import { TOKENS } from './tokens';
import { Logger } from './Logger';

export class ApiService {
  /*                        ↓ The optional dependency. */
  constructor(private logger?: Logger) {}
}
```

And inject it using the `optional` token field:

```typescript title="ApiService.ts"
injected(
  ApiService,
  TOKENS.logger.optional /* ← The optional dependency token. */,
);
```

When using `optional` tokens, the Brani container will not throw an error
if the dependency is not bound in the container, but will return undefined.
