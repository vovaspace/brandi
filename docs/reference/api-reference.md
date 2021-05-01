---
id: api-reference
title: API Reference
sidebar_label: API Reference
slug: /reference
---

Brandi is designed to be as simple and clear as possible.

This section documents the complete Brandi API.

## Container

- [`Container`](./container.md)
- [`createContainer()`](./container.md#createcontainer)

### `Container` Methods

- [`bind(token)`](./container.md#bindtoken)
  - [`toConstant(value)`](./binding-types.md#toconstantvalue)
  - [`toFactory(creator, [initializer])`](./binding-types.md#tofactorycreator-initializer)
  - [`toInstance(creator)`](./binding-types.md#toinstancecreator)
    - [`inContainerScope()`](./binding-scopes.md#incontainerscope)
    - [`inResolutionScope()`](./binding-scopes.md#inresolutionscope)
    - [`inSingletonScope()`](./binding-scopes.md#insingletonscope)
    - [`inTransientScope()`](./binding-scopes.md#intransientscope)
- [`capture()`](./container.md#capture)
- [`clone()`](./container.md#clone)
- [`extend(container)`](./container.md#extendcontainer)
- [`get(token)`](./container.md#gettoken)
- [`restore()`](./container.md#restore)
- [`use(...tokens)`](./container.md#usetokensfrommodule)
  - [`from(module)`](./container.md#usetokensfrommodule)
- [`when(condition)`](./container.md#whencondition)

## Dependency Modules

- [`DependencyModule`](./dependency-modules.md)
- [`createDependencyModule()`](./dependency-modules.md#createdependencymodule)

## Pointers

- [`token(description)`](./pointers-and-registrators.md#tokentdescription)
- [`tag(description)`](./pointers-and-registrators.md#tagdescription)

## Registrators

- [`injected(target, ...tokens)`](./pointers-and-registrators.md#injectedtarget-tokens)
- [`tagged(target, ...tags)`](./pointers-and-registrators.md#taggedtarget-tags)
