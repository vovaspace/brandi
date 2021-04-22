---
id: binding-scopes
title: Binding Scopes
sidebar_label: Binding Scopes
---

This section documents controlling the scope of the dependencies.

## `inSingletonScope()`

Each getting will return the same instance.

#### Example

```typescript
container.bind(TOKENS.apiService).toInstance(ApiService).inSingletonScope();

const apiServiceFirst = container.get(TOKENS.apiService);
const apiServiceSecond = container.get(TOKENS.apiService);

expect(apiServiceFirst).toBe(apiServiceSecond);
```

---

## `inTransientScope()`

New instance will be created with each getting.

#### Example

```typescript
container.bind(TOKENS.apiService).toInstance(ApiService).inTransientScope();

const apiServiceFirst = container.get(TOKENS.apiService);
const apiServiceSecond = container.get(TOKENS.apiService);

expect(apiServiceFirst).not.toBe(apiServiceSecond);
```

---

## `inContainerScope()`

The container will return the same instance with each getting.
This is similar to being a singleton,
however if the container has a [child container](./hierarchical-containers.md) or a [clone](./container-api#clone),
that child container or clone will get an instance unique to it.

#### Example

```typescript
const parentContainer = new Container();

parentContainer
  .bind(TOKENS.apiService)
  .toInstance(ApiService)
  .inTransientScope();

const childContainer = new Container(parentContainer);

/* Getting instances from the parent container. */
const apiServiceParentFirst = parentContainer.get(TOKENS.apiService);
const apiServiceParentSecond = parentContainer.get(TOKENS.apiService);

/* Getting instances from the child container */
const apiServiceChildFirst = childContainer.get(TOKENS.apiService);
const apiServiceChildSecond = childContainer.get(TOKENS.apiService);

/* The instances gotten from the same container are the same. */
expect(apiServiceParentFirst).toBe(apiServiceParentSecond);
expect(apiServiceChildFirst).toBe(apiServiceChildFirst);

/* The instances gotten from different containers are different. */
expect(apiServiceParentFirst).not.toBe(apiServiceChildFirst);
expect(apiServiceParentSecond).not.toBe(apiServiceChildSecond);
```

---

## `inResolutionScope()`

The same instance will be got for each getting of this dependency during a single resolution chain.

#### Example

```typescript
class EmailService {}

class SettingsService {
  constructor(public emailService: EmailService) {}
}

class UserService {
  constructor(
    public settingsService: SettingsService,
    public emailService: EmailService,
  ) {}
}

const TOKENS = {
  emailService: token<EmailService>('emailService'),
  settingsService: token<SettingsService>('settingsService'),
  userService: token<UserService>('userService'),
};

injected(SettingsService, TOKENS.emailService);
injected(UserService, TOKENS.settingsService, TOKENS.emailService);

const container = new Container();

container
  .bind(TOKENS.emailService)
  .toInstance(EmailService)
  .inResolutionScope(); /* ← `EmailService` in resolution scope. */

container
  .bind(TOKENS.settingsService)
  .toInstance(SettingsService)
  .inTransientScope();

container.bind(TOKENS.userService).toInstance(UserService).inTransientScope();

const userService = container.get(TOKENS.userService);

/* `EmailService` instances are the same for this resolution chain. */
expect(userService.emailService).toBe(userService.settingsService.emailService);
```

---

## `inGlobalScope()`

Each getting from any container with any token will return the same instance.

#### Example

<!-- prettier-ignore-start -->
```typescript
const parentContainer = new Container();
const childContainer = new Container(parentContainer);
const independentContainer = new Container();

parentContainer
  .bind(TOKENS.apiService)
  .toInstance(ApiService)
  .inGlobalScope();

childContainer
  .bind(TOKENS.apiService)
  .toInstance(ApiService)
  .inGlobalScope();

childContainer
  .bind(TOKENS.secondApiService) /* ← Another token, */
  .toInstance(ApiService)        /* ← But the same class. */
  .inGlobalScope();

independentContainer
  .bind(TOKENS.apiService)
  .toInstance(ApiService)
  .inGlobalScope();

const apiServiceParent = parentContainer.get(TOKENS.apiService);
const apiServiceChild = childContainer.get(TOKENS.apiService);
const secondApiServiceChild = childContainer.get(TOKENS.secondApiService);
const apiServiceIndependent = independentContainer.get(TOKENS.apiService);

/* The instances are the same. */
expect(apiServiceParent).toBe(apiServiceChild);
expect(apiServiceParent).toBe(apiServiceIndependent);
expect(apiServiceChild).toBe(secondApiServiceChild);
expect(apiServiceChild).toBe(apiServiceIndependent);
```
<!-- prettier-ignore-end -->
