---
id: binding-types
title: Binding Types
sidebar_label: Binding Types
---

## `toConstant(value)`

Binds the token to the constant value.

### Arguments

1. `value`: `TokenType<Token>` — the value that will be bound to the token.

### Example

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

## `toInstance(creator)`

Binds the token to an instance in one of the [scopes](./binding-scopes.md).

### Arguments

1. `creator`: `(new (...args: any[]) => TokenType<Token>) | ((...args: any[]) => TokenType<Token>)` —
   the instance creator that will be bound to the token.

### Returns

[Binding Scope](./binding-scopes.md) syntax:

- [`inSingletonScope()`](./binding-scopes.md#insingletonscope)
- [`inTransientScope()`](./binding-scopes.md#intransientscope)
- [`inContainerScope()`](./binding-scopes.md#incontainerscope)
- [`inResolutionScope()`](./binding-scopes.md#inresolutionscope)

### Examples

#### Class Instance

```typescript
import { Container, token } from 'brandi';

class ApiService {
  /* ... */
}

const TOKENS = {
  apiService: token<ApiService>('apiService'),
};

const container = new Container();
container.bind(TOKENS.apiService).toInstance(ApiService).inTransientScope();

const apiService = container.get(TOKENS.apiService);

expect(apiService).toBeInstanceOf(ApiService);
```

#### Function Call Result

```typescript
import { Container, token } from 'brandi';

interface ApiService {
  /* ... */
}

const createApiService = (): ApiService => {
  /* ... */
};

const TOKENS = {
  apiService: token<ApiService>('apiService'),
};

const container = new Container();
container
  .bind(TOKENS.apiService)
  .toInstance(createApiService)
  .inTransientScope();

const apiService = container.get(TOKENS.apiService);

expect(apiService).toStrictEqual<ApiService>({
  /* ... */
});
```

### Injetions

If the constructor or function has arguments you need to register dependencies
by [`injected`](./pointers-and-registrators.md#injectedtarget-tokens) registrator.

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

## `toFactory(creator, [initializer])`

Binds the token to the factory.

### Arguments

1. `creator` — the instance creator which the factory will use;
2. `[initializer]` — optional function called after the instance is created.

### Examples

#### Simple Factory

```typescript
import { Container, Factory, token } from 'brandi';

class ApiService {
  /* ... */
}

const TOKENS = {
  apiServiceFactory: token<Factory<ApiService>>('Factory<ApiService>'),
};

const container = new Container();

/*                                       ↓ Binds the factory. */
container.bind(TOKENS.apiServiceFactory).toFactory(ApiService);

const apiServiceFactory = container.get(TOKENS.apiServiceFactory);
const apiService = apiServiceFactory();

expect(apiService).toBeInstanceOf(ApiService);
```

#### Factory With Initializer

```typescript
import { Container, Factory, token } from 'brandi';

class ApiService {
  init() {
    /* ... */
  }

  /* ... */
}

const TOKENS = {
  apiServiceFactory: token<Factory<ApiService>>('Factory<ApiService>'),
};

const container = new Container();

container
  .bind(TOKENS.apiServiceFactory)
  /*                     ↓ Binds the factory with the initializer. */
  .toFactory(ApiService, (instance) => instance.init());

const apiServiceFactory = container.get(TOKENS.apiServiceFactory);

/*                 ↓ The initializer will be called after the instance is created. */
const apiService = apiServiceFactory();

expect(apiService).toBeInstanceOf(ApiService);
```

#### Factory With Arguments

```typescript
import { Container, Factory, token } from 'brandi';

class ApiService {
  public key: string;

  public setKey(key: string) {
    this.key = key;
  }

  /* ... */
}

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

const apiServiceFactory = container.get(TOKENS.apiServiceFactory);
const apiService = apiServiceFactory('#key9124');

expect(apiService).toBeInstanceOf(ApiService);
expect(apiService.key).toBe('#key9124');
```

#### Functional Factory

```typescript
import { Container, Factory, token } from 'brandi';

interface ApiService {
  /* ... */
}

const createApiService = (): ApiService => {
  /* ... */
};

const TOKENS = {
  apiServiceFactory: token<Factory<ApiService>>('Factory<ApiService>'),
};

const container = new Container();

container.bind(TOKENS.apiServiceFactory).toFactory(createApiService);

const apiServiceFactory = container.get(TOKENS.apiServiceFactory);
const apiService = apiServiceFactory();

expect(apiService).toStrictEqual<ApiService>({
  /* ... */
});
```

#### Instance Caching Factory

```typescript
import { Container, Factory, token } from 'brandi';

class ApiService {
  /* ... */
}

const TOKENS = {
  apiService: token<ApiService>('apiService'),
  apiServiceFactory: token<Factory<ApiService>>('Factory<ApiService>'),
};

const container = new Container();

container
  .bind(TOKENS.apiService)
  .toInstance(ApiService)
  .inSingletonScope() /* ← Binds the token to `ApiService` instance in singleton scope. */;

container
  .bind(TOKENS.apiServiceFactory)
  .toFactory(() => container.get(TOKENS.apiService));

const apiServiceFactory = container.get(TOKENS.apiService);

const firstApiService = apiServiceFactory();
const secondApiService = apiServiceFactory();

expect(firstApiService).toBe(secondApiService);
```

#### Factory With Async Creator

```typescript
import { AsyncFactory, Container, token } from 'brandi';

interface ApiService {
  /* ... */
}

/*                       ↓ Async creator. */
const createApiService = async (): Promise<ApiService> => {
  /* ... */
};

const TOKENS = {
  /*                 ↓ Token with `AsyncFactory` type. */
  apiServiceFactory: token<AsyncFactory<ApiService>>(
    'AsyncFactory<ApiService>',
  ),
};

const container = new Container();

container.bind(TOKENS.apiServiceFactory).toFactory(createApiService);

const apiServiceFactory = container.get(TOKENS.apiServiceFactory);

/**
 *                 ↓ Will wait for the creation resolution
 *                   and then call the initializer, if there is one.
 */
const apiService = await apiServiceFactory();

expect(apiService).toStrictEqual<ApiService>({
  /* ... */
});
```

#### Factory With Async Initializer

```typescript
import { AsyncFactory, Container, token } from 'brandi';

class ApiService {
  init(): Promise<unknown> {
    /* ... */
  }

  /* ... */
}

const TOKENS = {
  /*                 ↓ Token with `AsyncFactory` type. */
  apiServiceFactory: token<AsyncFactory<ApiService>>(
    'AsyncFactory<ApiService>',
  ),
};

const container = new Container();

container
  .bind(TOKENS.apiServiceFactory)
  /*                                         ↓ Returns a `Promise`. */
  .toFactory(createApiService, (instance) => instance.init());

const apiServiceFactory = container.get(TOKENS.apiServiceFactory);

/*                 ↓ Will wait for the initialization resolution. */
const apiService = await apiServiceFactory();

expect(apiService).toBeInstanceOf(ApiService);
```
