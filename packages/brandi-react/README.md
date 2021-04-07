# 🥃 ⚛️ Brandi-React

**Brandi-React** is the React bindings layer
for [Brandi](https://github.com/vovaspace/brandi/tree/main/packages/brandi) — the dependency injection container. It lets your React components get dependencies from Brandi containers.

[![License](https://img.shields.io/badge/license-ISC-blue.svg)](https://github.com/vovaspace/brandi/blob/main/packages/brandi-react/LICENSE)
[![NPM Version](https://img.shields.io/npm/v/brandi-react.svg?style=flat)](https://www.npmjs.com/package/brandi-react)
[![Minzipped Size](https://badgen.net/bundlephobia/minzip/brandi-react)](https://bundlephobia.com/result?p=brandi-react)

## Installation

Brandi-React requires **React 16.8 or later**.
You'll also need to [install](https://brandi.js.org/getting-started/installation) Brandi.

```bash
# NPM
npm install brandi-react
```

```bash
# Yarn
yarn add brandi-react
```

The Brandi-React source code is written in TypeScript but we precompile both CommonJS and ESModule builds to **ES2018**.

Additionally, we provide builds precompiled to **ESNext** by `esnext`, `esnext:main` and `esnext:module` fields.

**TypeScript** type definitions are **included** in the library and do not need to be installed additionally.

## API Reference

- [`ContainerProvider`](https://brandi.js.org/brandi-react/container-provider) —
  makes the Brandi container available to any nested components that need to use injections.
- [`useInjection(token)`](https://brandi.js.org/brandi-react/use-injection) —
  allows you to get a dependency from a container.
- [`createInjectionHooks(...tokens)`](https://brandi.js.org/brandi-react/create-injection-hooks) —
  creates hooks for getting dependencies more easily.
- [`tagged(...tags)(Component, [isolated])`](https://brandi.js.org/brandi-react/tagged) —
  attaches tags to the component and all nested components.

You can find the full Brandi documentation on the [website](https://brandi.js.org).

## Example

```tsx
// index.ts

import { createContainer } from 'brandi';
import { ContainerProvider } from 'brandi-react';
import React from 'react';
import ReactDOM from 'react-dom';

import { TOKENS } from './tokens';
import { ApiService } from './ApiService';
import { App } from './App';

const container = createContainer();

container.bind(TOKENS.apiService).toInstance(ApiService).inTransientScope();

ReactDOM.render(
  <ContainerProvider container={container}>
    <App />
  </ContainerProvider>,
  document.getElementById('root'),
);
```

```tsx
// UserComponent.tsx

import { useInjection } from 'brandi-react';
import { FunctionComponent } from 'react';

import { TOKENS } from './tokens';

export const UserComponent: FunctionComponent = () => {
  const apiService = useInjection(TOKENS.apiService);

  /* ... */

  return (/* ... */);
}
```
