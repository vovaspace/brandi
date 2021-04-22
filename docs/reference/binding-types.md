---
id: binding-types
title: Binding Types
sidebar_label: Binding Types
---

## `toConstant(value)`

Binds the token to the constant value.

#### Arguments

1. `value`: `TokenType<Token>` — the value that will be bound to the token.

#### Example

```typescript
import { Container, token } from 'brandi';

const TOKENS = {
  apiKey: token<string>('API Key'),
};

const container = new Container();
container.bind(TOKENS.apiKey).toConstant('#key9428');

const key = container.get(TOKENS.apiKey);

expect(key).toBe('#key9428');
```

---

## `toInstance(ctor)`

Binds the token to an class instance in one of the [scopes](./binding-scopes.md).

#### Arguments

1. `ctor`: `new (...args: any[]) => TokenType<Token>` — the instance constructor that will be bound to the token.

#### Returns

[Binding Scope](./binding-scopes.md) syntax:

- [`inSingletonScope()`](./binding-scopes.md#insingletonscope)
- [`inTransientScope()`](./binding-scopes.md#intransientscope)
- [`inContainerScope()`](./binding-scopes.md#incontainerscope)
- [`inResolutionScope()`](./binding-scopes.md#inresolutionscope)
- [`inGlobalScope()`](./binding-scopes.md#inglobalscope)

#### Example

```typescript
import { Container, token } from 'brandi';

class ApiService {}

const TOKENS = {
  apiService: token<ApiService>('apiService'),
};

const container = new Container();
container.bind(TOKENS.apiService).toInstance(ApiService).inTransientScope();

const apiService = container.get(TOKENS.apiService);

expect(apiService).toBeInstanceOf(ApiService);
```

### Constructor Injetion

If the constructor has arguments you need to inject dependencies
by [`injected`](./pointers-and-registrators#injectedtargettokens) registrator.

```typescript
import { injected } from 'brandi';

import { TOKENS } from './tokens';
import type { HttpClient } from './HttpClient';

export class ApiService {
  constructor(private http: HttpClient) {}
}

injected(ApiService, TOKENS.httpClient);
```

---

## `toCall(func)`

The logic of `toCall` is similar to [`toInstance`](#toinstance),
except that it binds the token to a function call result instead of a class instance.

#### Arguments

1. `func`: `(...args: any[]) => TokenType<Token>` — function whose call result will be bound to the token.

#### Returns

[Binding Scope](./binding-scopes.md) syntax:

- [`inSingletonScope()`](./binding-scopes.md#insingletonscope)
- [`inTransientScope()`](./binding-scopes.md#intransientscope)
- [`inContainerScope()`](./binding-scopes.md#incontainerscope)
- [`inResolutionScope()`](./binding-scopes.md#inresolutionscope)
- [`inGlobalScope()`](./binding-scopes.md#inglobalscope)

#### Example

```typescript
import { Container, token } from 'brandi';

interface API {
  /* API Logic */
}

const createApi: API = () => ({
  /* API Logic */
});

const TOKENS = {
  api: token<API>('API'),
};

const container = new Container();
container.bind(TOKENS.api).toCall(createApi).inTransientScope();

const api = container.get(TOKENS.api);

expect(api).toStrictEqual<API>({
  /* API Logic */
});
```

### Function Injetion

Just as with the [constructor injetion](#constructor-injetion), if the function has arguments
you need to inject dependencies by [`injected`](./pointers-and-registrators#injectedtargettokens) registrator.

```typescript
import { injected } from 'brandi';

import { TOKENS } from './tokens';

export const createApi = (apiKey: string) => ({
  /* API Logic */
});

injected(createApi, TOKENS.apiKey);

/* OR */

export const createApi = injected(
  (apiKey: string) => ({
    /* API Logic */
  }),
  TOKENS.apiKey,
);
```

---

## `toFactory(ctor, [initializer])`

Binds the token to the factory.

#### Arguments

1. `ctor` — the instance constructor which the factory will use;
2. `[initializer]` — function called after the instance is constructed.
   The logic of this function is explained in the examples below.

#### Example

##### Factory without arguments

```typescript
import { Container, Factory, token } from 'brandi';

class ApiService {}

const TOKENS = {
  apiServiceFactory: token<Factory<ApiService>>('Factory<ApiService>'),
};

const container = new Container();

/*                                       ↓ Binds the simple factory. */
container.bind(TOKENS.apiServiceFactory).toFactory(ApiService);

/* OR */

container
  .bind(TOKENS.apiServiceFactory)
  /*                     ↓ Binds the factory with the initializer. */
  .toFactory(ApiService, (instance) => instance.init());

const apiServiceFactory = container.get(TOKENS.apiService);
const apiService = apiServiceFactory();

expect(apiService).toBeInstanceOf(ApiService);
```

##### Factory with arguments

```typescript
import { Container, Factory, token } from 'brandi';

class ApiService {}

const TOKENS = {
  /*                       ↓ `Factory` generic with second argument. */
  apiServiceFactory: token<Factory<ApiService, [apiKey: string]>>(
    'Factory<ApiService>',
  ),
};

const container = new Container();

container
  .bind(TOKENS.apiServiceFactory)
  /*                     ↓ Binds the factory with `apiKey` argument. */
  .toFactory(ApiService, (instance, apiKey) => instance.setKey(apiKey));

const apiServiceFactory = container.get(TOKENS.apiService);
const apiService = apiServiceFactory('#key9124');

expect(apiService).toBeInstanceOf(ApiService);
expect(apiService.key).toBe('#key9124');
```

---

## `toCreator(func, [initializer])`

The logic of `toCreator` is similar to [`toFactory`](#tofactoryctor-initializer)
(like [`toInstance`](#toinstancector) and [`toCall`](#tocallfunc)),
except that it binds the token to a creator function instead of a factory.

You can use the same `Factory` generic to describe the token type
or use `Creator` alias.

#### Arguments

1. `func` — the function which the creator will use;
2. `[initializer]` — function called after the entity is created.
   The logic of this function is same as `toFactory`'s initializer.
