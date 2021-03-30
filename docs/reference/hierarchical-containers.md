---
id: hierarchical-containers
title: Hierarchical Containers
sidebar_label: Hierarchical Containers
---

Brandi allows you to build hierarchical DI systems.

In a hierarchical DI system, a container can have a parent container and multiple containers can be used in one application.
The containers form a hierarchical structure.

When you get a dependency from a container, the container tries to satisfy that dependency with it's own bindings.
If the container lacks bindings, it passes the request up to its parent container.
If that container can't satisfy the request, it passes it along to its parent container.
The requests keep bubbling up until we find an container that can handle the request or run out of container ancestors.

```typescript
class ApiService {}

const TOKENS = {
  apiService: token<ApiService>('apiService'),
};

const parentContainer = new Container();
parentContainer
  .bind(TOKENS.apiService)
  .toInstance(ApiService)
  .inTransientScope();

const childContainer = new Container(parentContainer);

const apiService = childContainer.get(TOKENS.apiService);

expect(apiService).toBeInstanceOf(ApiService);
```
