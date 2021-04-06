---
id: api-reference
title: API Reference
sidebar_label: API Reference
slug: /reference
---

Brandi is designed to be as simple and clear as possible.

This section documents the complete Brandi API.

## Container

- [`Container`](./container-api.md)
- [`createContainer`](./container-api.md#createcontainerparent)

### Container Methods

- [`bind(token)`](./container-api.md#bindtoken)
  - [`toConstant(value)`](./binding-types.md#toconstantvalue)
  - [`toInstance(ctor)`](./binding-types.md#toinstancector)
    - [`inContainerScope()`](./binding-scopes.md#incontainerscope)
    - [`inResolutionScope()`](./binding-scopes.md#inresolutionscope)
    - [`inSingletonScope()`](./binding-scopes.md#insingletonscope)
    - [`inTransientScope()`](./binding-scopes.md#intransientscope)
  - [`toCall(func)`](./binding-types.md#tocallfunc)
    - [`inContainerScope()`](./binding-scopes.md#incontainerscope)
    - [`inResolutionScope()`](./binding-scopes.md#inresolutionscope)
    - [`inSingletonScope()`](./binding-scopes.md#insingletonscope)
    - [`inTransientScope()`](./binding-scopes.md#intransientscope)
  - [`toFactory(ctor, [initializer])`](./binding-types.md#tofactoryctor-initializer)
  - [`toCreator(func, [initializer])`](./binding-types.md#tocreatorfunc-initializer)
- [`capture()`](./container-api.md#capture)
- [`clone()`](./container-api.md#clone)
- [`get(token)`](./container-api.md#gettoken)
- [`restore()`](./container-api.md#restore)
- [`when(condition)`](./container-api.md#whencondition)

## Pointers

- [`token(description)`](./pointers-and-registrators.md#tokentdescription)
- [`tag(description)`](./pointers-and-registrators.md#tagdescription)

## Registrators

- [`injected(target, ...tokens)`](./pointers-and-registrators.md#injectedtargettokens)
- [`tagged(target, ...tags)`](./pointers-and-registrators.md#taggedtargettags)
