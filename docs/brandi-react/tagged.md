---
id: tagged
title: tagged
sidebar_label: tagged
hide_title: true
---

# `tagged`

The `tagged(...tags)(Component, [isolated])` HoC attaches tags to the component and its child components.

Conditional Bindings are detailed
in [Conditional Bindings](../reference/conditional-bindings.md) section of the documentation.

## Arguments

### tagged(...tags)

1. `...tags`: [`Tag[]`](../reference/pointers-and-registrators.md#tagdescription) — tags to be attached to the component.

### tagged(...tags)(Component, [isolated])

1. `Component`: `React.ComponentType` — component to be wrapped.
2. `isolated?`: `boolean` — by default, the wrapped component and its child components inherit tags
   from from the upstream tagged components. You can use `isolated` option to disable this behavior.

## Returns

`React.ComponentType` — the wrapped component.

## Example

```typescript title="tags.ts"
import { tag } from 'brandi';
import { tagged } from 'brandi-react';

export const TAGS = {
  offline: tag('offline'),
};

export const withOfflineTag = tagged(TAGS.offline);
```

<!-- prettier-ignore-start -->
```tsx title="index.tsx"
import { createContainer } from 'brandi';
import { ContainerProvider } from 'brandi-react';
import React from 'react';
import ReactDOM from 'react-dom';

import { TOKENS } from './tokens';
import { TAGS } from './tags';
import { ApiService, OfflineApiService } from './ApiService';
import { App } from './App';

const container = createContainer();

container
  .bind(TOKENS.apiService)
  .toInstance(ApiService)
  .inTransientScope();

container
  .when(TAGS.offline)
  .bind(TOKENS.apiService)
  .toInstance(OfflineApiService)
  .inTransientScope();

ReactDOM.render(
  <ContainerProvider container={container}>
    <App />
  </ContainerProvider>,
  document.getElementById('root'),
);
```
<!-- prettier-ignore-end -->

```tsx title="UserComponent.tsx"
import { useInjection } from 'brandi-react';
import { FunctionComponent } from 'react';

import { TOKENS } from './tokens';

export const UserComponent: FunctionComponent = () => {
  /*    ↓ Will be `ApiService`. */
  const apiService = useInjection(TOKENS.apiService);

  /* ... */

  return (/* ... */);
}
```

```tsx title="SettingsComponent.tsx"
import { useInjection } from 'brandi-react';

import { TOKENS } from './tokens';
import { withOfflineTag } from './tags';

/*                               ↓ Tags the component. */
export const SettingsComponent = withOfflineTag(() => {
  /*    ↓ Will be `OfflineApiService`. */
  const apiService = useInjection(TOKENS.apiService);

  /* ... */

  return (/* ... */);
});
```
