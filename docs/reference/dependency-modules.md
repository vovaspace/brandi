---
id: dependency-modules
title: Dependency Modules
sidebar_label: Dependency Modules
---

By using Brandi, you can organize bindings in dependency modules.
In this section we will see how to create, organize and use your modules.

`DependencyModule` is a logical space to help you organize your bindings.
It is similar to [`Container`](./container.md), but it can only store dependencies, but not resolve or inject them.

## `DependencyModule` Methods

`DependencyModule` repeats the following [`Container`](./container.md) methods:

- [`bind(token)`](./container.md#bindtoken)
- [`use(...tokens).from(module)`](./container.md#usetokensfrommodule)
- [`when(condition)`](./container.md#whencondition)

## Using Dependency Modules

### Simple Example

Let's take an simple example, with using a binding from a module by the token:

```typescript
import { Container, DependencyModule, token } from 'brandi';

const TOKENS = {
  apiKey: token<string>('apiKey'),
};

const apiModule = new DependencyModule();
apiModule.bind(TOKENS.apiKey).toConstant('#key9428');

const container = new Container();
container.use(TOKENS.apiKey).from(apiModule);

const key = container.get(TOKENS.apiKey);

expect(key).toBe('#key9428');
```

Container will resolve the `apiKey` dependency from the module.

### More Complex Example

In this example, we have the `ApiService` that depends on a `apiKey`, API dependency module, and the `App` that depends on an `ApiService`.

Let's start with the token declaration:

```typescript title="tokens.ts"
import { token } from 'brandi';

import type { ApiService } from './api/ApiService';
import type { App } from './App';

export const TOKENS = {
  apiKey: token<string>('apiKey'),
  apiService: token<ApiService>('apiService'),
  app: token<App>('app'),
};
```

Then we will create the `ApiService` with a dependency on a `apiKey`:

```typescript title="api/ApiService.ts"
import { injected } from 'brandi';

import { TOKENS } from '../tokens';

export class ApiService {
  constructor(private apiKey: string) {}

  /* ... */
}

injected(ApiService, TOKENS.apiKey);
```

Then we will create the dependency module to which we will bind all the dependencies necessary for the API module:

```typescript title="api/module.ts"
import { DependencyModule } from 'brandi';

import { TOKENS } from '../tokens';

import { ApiService } from './ApiService';

export const apiModule = new DependencyModule();

apiModule.bind(TOKENS.apiKey).toConstant('#key9428');
apiModule.bind(TOKENS.apiService).toInstance(ApiService).inTransientScope();
```

Creating our `App` that depends on `ApiService`:

```typescript title="App.ts"
import { injected } from 'brandi';

import { TOKENS } from './tokens';
import type { ApiService } from './api/ApiService';

export class App {
  constructor(private apiService: ApiService) {}

  /* ... */
}

injected(App, TOKENS.apiService);
```

And finally configure the container:

```typescript title="container.ts"
import { Container } from 'brandi';

import { TOKENS } from './tokens';
import { apiModule } from './api/module';
import { App } from './App';

export const container = new Container();

/**
 *        ↓ We only use the `apiService` token that the `App` directly depends on.
 *          The `apiKey` token binding will be resolved from the `apiModule` automatically
 *          and it does not need to be bound additionally.
 */
container.use(TOKENS.apiService).from(apiModule);

container.bind(TOKENS.app).toInstance(App).inSingletonScope();
```

Let's run:

```typescript title="index.ts"
import { TOKENS } from './tokens';
import { container } from './container';

const app = container.get(TOKENS.app);

app.run();
```

:::note

Some of your dependency modules may use bindings from other modules.
If there are bindings of the same token in the module chain, the highest-level binding in the hierarchy will be used.

:::

## `createDependencyModule()`

`createDependencyModule()` — is alias for `new DependencyModule()`.
