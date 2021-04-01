---
id: basic-examples
title: Basic Examples
sidebar_label: Basic Examples
slug: /examples
---

Here are just basic examples.

## Getting Instance

**Binding types** and **scopes** are detailed in [Binding Types](../reference/binding-types.md)
and [Binding Scopes](../reference/binding-scopes.md) sections of the documentation.

<!-- prettier-ignore-start -->
```typescript
import { Container, token } from 'brandi';

class ApiService {}

const TOKENS = {
  /*          ↓ Creates a typed token. */
  apiService: token<ApiService>('apiService'),
};

const container = new Container();

container
  .bind(TOKENS.apiService)
  .toInstance(ApiService) /* ← Binds the token to an instance */
  .inTransientScope(); /*    ← in transient scope. */

/*                           ↓ Gets the instance from the container. */
const apiService = container.get(TOKENS.apiService);

expect(apiService).toBeInstanceOf(ApiService);
```
<!-- prettier-ignore-end -->

## Snapshoting

<!-- prettier-ignore-start -->
```typescript
import { Container, token } from 'brandi';

const TOKENS = {
  apiKey: token<string>('API Key'),
};

const container = new Container();

container
  .bind(TOKENS.apiKey)
  .toConstant('#key9428'); /* ← Binds the token to some string. */

/*        ↓ Captures (snapshots) the current container state. */
container.capture();

container
  .bind(TOKENS.apiKey)
  .toConstant('#testKey'); /* ← Binds the same token to another value. */
                           /*   For example, this can be used in testing. */

const testKey = container.get(TOKENS.apiKey);

/*        ↓ Restores the captured container state. */
container.restore();

const originalKey = container.get(TOKENS.apiKey);

expect(testKey).toBe('#testKey');
expect(originalKey).toBe('#key9428');
```
<!-- prettier-ignore-end -->

Other `Container` methods are detailed
in [Container API](../reference/container-api.md) section of the documentation.

## Hierarchical Containers

Hierarchical containers are detailed
in [Hierarchical Containers](../reference/hierarchical-containers.md) section of the documentation.

```typescript
import { Container, token } from 'brandi';

class ApiService {}

const TOKENS = {
  apiService: token<ApiService>('apiService'),
};

const parentContainer = new Container();

parentContainer
  .bind(TOKENS.apiService)
  .toInstance(ApiService)
  .inTransientScope();

/*                     ↓ Creates a container with the parent. */
const childContainer = new Container(parentContainer);

/**                ↓ That container can't satisfy the getting request,
 *                   it passes it along to its parent container.
 *                   The intsance will be gotten from the parent container.
 */
const apiService = childContainer.get(TOKENS.apiService);

expect(apiService).toBeInstanceOf(ApiService);
```
