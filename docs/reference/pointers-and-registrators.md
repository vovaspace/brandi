---
id: pointers-and-registrators
title: Pointers and Registrators
sidebar_label: Pointers and Registrators
---

## Pointers

A pointer in Brandi terminology is a unique value that is used for relating entities.

### `token<T>(description)`

Creates a unique token with the type.

#### Arguments

1. `description`: `string` — a description of the token to be used in logs and error messages.

#### Returns

`Token<T>` — a unique token with the type.

#### Type Safety

The token mechanism in Brandi provides type safety when binding and getting dependencies.

```typescript
import { Container, token } from 'brandi';

const TOKENS = {
  apiKey: token<string>('API Key') /* ← The token with `string` type.  */,
};

const container = new Container();

/*                            ↓ Binding the `string` type value. It's OK. */
container.bind(TOKENS.apiKey).toConstant('#key9428');

/**
 *                            ↓ Trying to bind the `string` type token to the `number` type value:
 *                              TS Error: `Argument of type 'number' is not assignable
 *                                         to parameter of type 'string'. ts(2345)`.
 */
container.bind(TOKENS.apiKey).toConstant(9428);

const key = container.get(TOKENS.apiKey);

type Key = typeof key; /* ← The type is derived from the token. `type Key = string;`. */

/*    ↓ TS Error: `Type 'string' is not assignable to type 'number'. ts(2322)` */
const numKey: number = container.get(TOKENS.apiKey);
```

---

### `tag(description)`

Creates a unique tag.

#### Arguments

1. `description`: `string` — a description of the tag to be used in logs and error messages.

#### Returns

`Tag` — a unique tag.

---

## Registrators

### `injected(target, ...tokens)`

Registers target injections.

#### Arguments

1. `target` — constructor or function whose dependencies will be injected.
2. `...tokens`: `TokenValue[]` — dependency tokens.

#### Returns

`target` — the first argument.

#### Example

```typescript title="ApiService.ts"
import { injected } from 'brandi';
import { TOKENS } from './tokens';
import { Logger } from './Logger';

export class ApiService {
  constructor(private apiKey: string, private logger?: Logger) {}
}

injected(ApiService, TOKENS.apiKey, TOKENS.logger.optional);
```

#### Type Safety

Injections in Brandi are strictly typed.

```typescript title="tokens.ts"
import { token } from 'brandi';

export const TOKENS = {
  strKey: token<string>('String API Key'),
  numKey: token<number>('Number API Key'),
};
```

<!-- prettier-ignore-start -->
```typescript title="ApiService.ts"
import { injected } from 'brandi';
import { TOKENS } from './tokens';
import { Logger } from './Logger';

export class ApiService {
  constructor(
    private apiKey: string  /* ← The `string` type dependency. */,
    private logger?: Logger /* ← The optional dependency. */,
  ) {}
}

injected(
  ApiService,
  TOKENS.strKey           /* ← Injecting the `string` type dependency. It's OK. */,
  TOKENS.logger.optional  /* ← Injecting the optional dependency. It's OK. */,
);

injected(
  ApiService,

  TOKENS.numKey, /* ← Injecting the `number` type dependency.
                  *   TS Error: `Type 'number' is not assignable to type 'string'. ts(2345)`.
                  */

  TOKENS.logger, /* ← Injecting the required value instead of the optional one.
                  *   TS Error: `Argument of type 'Token<Logger>'
                  *              is not assignable to parameter of type 'OptionalToken<Logger>'`.
                  */
);
```
<!-- prettier-ignore-end -->

---

### `tagged(target, ...tags)`

Tags target.
For more information about tags, see the [Conditional Bindings](./conditional-bindings.md) documentation section.

#### Arguments

1. `target` — constructor or function that will be tagged.
2. `...tags`: `Tag[]` — tags.

#### Returns

`target` — the first argument.

#### Example

```typescript title="ApiService.ts"
import { tagged } from 'brandi';
import { TAGS } from './tags';

export class ApiService {}

tagged(ApiService, TAGS.offline);
```
