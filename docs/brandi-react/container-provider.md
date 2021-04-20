---
id: container-provider
title: ContainerProvider
sidebar_label: ContainerProvider
hide_title: true
---

# `ContainerProvider`

The `ContainerProvider` component makes the Brandi container available to any nested components that need to use injections.

The [`useInjection`](./use-injection.md) hook can then access the provided container via React's Context mechanism.

## Props

1. `container`: [`Container`](../reference/container-api.md#container) — the provider will not pass the orginal container,
   but its clone received from the [`Container.clone()`](../reference/container-api.md#clone) method
   (This can be useful together with using the [container scope](../reference/binding-scopes.md#incontainerscope)).
   This behavior is implemented so that the provider can safely set the container
   received from the upstream provider to the `Container.parent`.
   In this way, we can implement a [hierarchical DI system](../reference/hierarchical-containers.md)
   based on a hierarchy of React components.
2. `isolated?`: `boolean` — as mentioned above, the provider sets the container
   received from the upstream provider to the `Container.parent`.
   `isolated` prop disables this behavior and saves original `Container.parent` value.
3. `children`: `ReactNode`.

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
