# 🥃 Brandi

**Brandi** is a dependency injection container powered by TypeScript.

[![License](https://img.shields.io/npm/l/brandi.svg)](https://github.com/vovaspace/brandi/blob/main/packages/brandi/LICENSE)
[![NPM Version](https://img.shields.io/npm/v/brandi.svg)](https://www.npmjs.com/package/brandi)
[![Minzipped Size](https://img.shields.io/bundlephobia/minzip/brandi.svg)](https://bundlephobia.com/result?p=brandi)

- **Framework agnostic.** Can work with any UI or server framework.
- **Lightweight and Effective.** It is tiny and designed for maximum performance.
- **Strongly typed.** TypeScript support out of box.
- **Decorators free.** Does not require additional parameters in `tsconfig.json` and `Reflect` polyfill.

## Installation

Brandi is available as a package for use with a module bundler or in a Node application.

```bash
# NPM
npm install brandi
```

```bash
# Yarn
yarn add brandi
```

The Brandi source code is written in TypeScript but we precompile both CommonJS and ESModule builds to **ES2018**.

Additionally, we provide builds precompiled to **ESNext** by `esnext`, `esnext:main` and `esnext:module` fields.

### TypeScript

TypeScript type definitions are **included** in the library and do not need to be installed additionally.

### No Dependencies

Brandi has no dependencies, but requires the following globals in order to work:

- `Symbol`
- `WeakMap`

### Production

By default, Brandi will be in development mode. The development mode includes warnings about common mistakes
and `capture()/resotre()` `Container` methods.

Don't forget to set `process.env.NODE_ENV` to `production` when deploying your application.

## Documentation

You can find the Brandi documentation on the [website](https://brandi.js.org).

The documentation is divided into several sections:

- Getting Started
  - [Overview](https://brandi.js.org/getting-started)
  - [Installation](https://brandi.js.org/getting-started/installation)
- Reference
  - [API Reference](https://brandi.js.org/reference)
  - [Pointers and Registrators](https://brandi.js.org/reference/pointers-and-registrators)
  - [Container](https://brandi.js.org/reference/container)
  - [Binding Types](https://brandi.js.org/reference/binding-types)
  - [Binding Scopes](https://brandi.js.org/reference/binding-scopes)
  - [Optional Dependencies](https://brandi.js.org/reference/optional-dependencies)
  - [Dependency Modules](https://brandi.js.org/reference/dependency-modules)
  - [Hierarchical Containers](https://brandi.js.org/reference/hierarchical-containers)
  - [Conditional Bindings](https://brandi.js.org/reference/conditional-bindings)
- Brandi-React
  - [Overview](https://brandi.js.org/brandi-react)
  - [`ContainerProvider`](https://brandi.js.org/brandi-react/container-provider)
  - [`useInjection`](https://brandi.js.org/brandi-react/use-injection)
  - [`createInjectionHooks`](https://brandi.js.org/brandi-react/create-injection-hooks)
  - [`tagged`](https://brandi.js.org/brandi-react/tagged)
- Examples
  - [Basic Examples](https://brandi.js.org/examples)

## Examples

Here are just basic examples.

<!-- More examples can be found in the documentation in the [Examples](https://brandi.js.org/examples) section. -->

### Getting Instance

**Binding types** and **scopes** are detailed in [Binding Types](https://brandi.js.org/reference/binding-types)
and [Binding Scopes](https://brandi.js.org/reference/binding-scopes) sections of the documentation.

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

### Snapshoting

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
in [Container](https://brandi.js.org/reference/container) section of the documentation.

### Hierarchical Containers

Hierarchical containers are detailed
in [Hierarchical Containers](https://brandi.js.org/reference/hierarchical-containers) section of the documentation.

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
const childContainer = new Container().extend(parentContainer);

/**                ↓ That container can't satisfy the getting request,
 *                   it passes it along to its parent container.
 *                   The intsance will be gotten from the parent container.
 */
const apiService = childContainer.get(TOKENS.apiService);

expect(apiService).toBeInstanceOf(ApiService);
```
