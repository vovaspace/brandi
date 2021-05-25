---
id: container-provider
title: ContainerProvider
sidebar_label: ContainerProvider
---

The `ContainerProvider` component makes the Brandi container available to any nested components that need to use injections.

The [`useInjection`](./use-injection.md) hook can then access the provided container via React's Context.

## Props

- `container`: [`Container`](../reference/container.md#container) — the provider will not pass the orginal container,
  but its clone received from the [`Container.clone()`](../reference/container.md#clone) method
  (This can be useful together with using the [container scope](../reference/binding-scopes.md#incontainerscope)).
  This behavior is implemented so that the provider can safely [extends](../reference/container#extendcontainer) the container
  with a container received from the upstream provider.
  In this way, we can implement a [hierarchical DI system](../reference/hierarchical-containers.md)
  based on a hierarchy of React components.
- `[isolated]`: `boolean` — as mentioned above, the provider extends the container
  with a container received from the upstream provider.
  `isolated` prop disables this behavior.
- `children`: `ReactNode`.

## Examples

### Providing Root Container

```tsx
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

### Providing a Module's Own Container

The container of this module will automatically access the root container from the previous example.
Thus the module components can request a dependency by `TOKENS.apiService` token and get it from the parent container.

```tsx
import { createContainer } from 'brandi';
import { ContainerProvider } from 'brandi-react';
import { FunctionComponent } from 'react';

import { TOKENS } from '../tokens';

import { UserService } from './UserService';
import { UserComponent } from './UserComponent';

const container = createContainer();

container.bind(TOKENS.userService).toInstance(UserService).inTransientScope();

export const UserModule: FunctionComponent = () => (
  <ContainerProvider container={container}>
    <UserComponent />
  </ContainerProvider>,
);
```
