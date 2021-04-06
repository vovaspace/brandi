---
id: conditional-bindings
title: Conditional Bindings
sidebar_label: Conditional Bindings
---

Brandi allows you to use **tags** and **targets** to control which implementation of the abstraction will be injected to a target.

Creating tokens:

```typescript title="tokens.ts"
import { token } from 'brandi';

import type { Cacher } from './Cacher';
import type { UserService } from './UserService';
import type { SettingsService } from './SettingsService';
import type { AdminService } from './AdminService';

export const TOKENS = {
  cacher: token<Cacher>('cacher'),
  userService: token<UserService>('userService'),
  settingsService: token<SettingsService>('settingsService'),
  adminService: token<AdminService>('adminService'),
};
```

Creating tags:

```typescript title="tags.ts"
import { tag } from 'brandi';

export const TAGS = {
  offline: tag('offline'),
};
```

Creating two types of cacher with a common interface:

```typescript title="Cacher.ts"
export interface Cacher {
  put(key: string, value: unknown): void;
}

export class OnlineCacher implements Cacher {
  /* ... */
}

export class LocalCacher implements Cacher {
  /* ... */
}
```

Creating some services with a dependency on the `Cacher`:

```typescript title="UserService.ts"
import { injected } from 'brandi';

import { TOKENS } from './tokens';
import { Cacher } from './Cacher';

export class UserService {
  constructor(public cacher: Cacher) {}
}

injected(UserService, TOKENS.cacher);
```

```typescript title="SettingsService.ts"
import { injected } from 'brandi';

import { TOKENS } from './tokens';
import { Cacher } from './Cacher';

export class SettingsService {
  constructor(public cacher: Cacher) {}
}

injected(SettingsService, TOKENS.cacher);
```

```typescript title="AdminService.ts"
import { injected } from 'brandi';

import { TOKENS } from './tokens';
import { Cacher } from './Cacher';

export class AdminService {
  constructor(public cacher: Cacher) {}
}

injected(AdminService, TOKENS.cacher);
```

Configuring the container:

<!-- prettier-ignore-start -->
```typescript title="container.ts"
import { Container, tagged } from 'brandi';

import { TOKENS } from './tokens';
import { TAGS } from './tags';
import { OnlineCacher, LocalCacher } from './Cacher';
import { UserService } from './UserService';
import { SettingsService } from './SettingsService';
import { AdminService } from './AdminService';

tagged(SettingsService, TAGS.offline); /* ← Tags `SettingsService`. */

export const container = new Container();

container
  .bind(TOKENS.cacher) /* ← Binds to `OnlineCacher` in common cases. */
  .toInstance(OnlineCacher)
  .inTransientScope();

container
  .when(TAGS.offline) /* ← Binds to `LocalCacher` when target tagget by `offline` tag. */
  .bind(TOKENS.cacher)
  .toInstance(LocalCacher)
  .inTransientScope();

container
  .when(AdminService) /* ← Binds to `LocalCacher` when target is `AdminService`. */
  .bind(TOKENS.cacher)
  .toInstance(LocalCacher)
  .inTransientScope();

container.bind(TOKENS.userService).toInstance(UserService).inTransientScope();
container.bind(TOKENS.settingsService).toInstance(SettingsService).inTransientScope();
container.bind(TOKENS.adminService).toInstance(AdminService).inTransientScope();
```
<!-- prettier-ignore-end -->

Dependencies are injected into services based on the tag:

```typescript title="index.ts"
import { TOKENS } from './tokens';
import { OnlineCacher, LocalCacher } from './Cacher';
import { container } from './container';

const userService = container.get(TOKENS.userService);
const settingsService = container.get(TOKENS.settingsService);
const adminService = container.get(TOKENS.adminService);

expect(userService.cacher).toBeInstanceOf(OnlineCacher);
expect(settingsService.cacher).toBeInstanceOf(LocalCacher);
expect(adminService.cacher).toBeInstanceOf(LocalCacher);
```
