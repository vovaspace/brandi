---
id: container-api
title: Container API
sidebar_label: Container API
---

This section documents `Container` creation and the top-level `Container` methods.

## `Container`

`Container` is a Brandi class whose instances store information about dependencies,
resolve dependencies, and inject dependencies into targets.

#### Constructor Arguments

1. `parent`: `Container` — a parent container.
   For more information, see [Hierarchical Containers](./hierarchical-containers.md) section.

### `createContainer(parent)`

`createContainer(parent)` — is alias for `new Container(parent)`.

## Top-Level Container Methods

### `bind(token)`

Binds the token to the dependency.

#### Arguments

1. `token`: [Token](./pointers-and-registrators.md#tokentdescription).

#### Returns

[Binding Type](./binding-types.md) syntax:

- [`toConstant(value)`](./binding-types.md#toconstantvalue)
- [`toInstance(ctor)`](./binding-types.md#toinstancector)
- [`toCall(func)`](./binding-types.md#tocallfunc)
- [`toFactory(ctor, [initializer])`](./binding-types.md#tofactoryctor-initializer)
- [`toCreator(func, [initializer])`](./binding-types.md#tocreatorfunc-initializer)

---

### `get(token)`

Gets a dependency bound to the token.

#### Arguments

1. `token`: [`Token`](./pointers-and-registrators.md#tokentdescription).

#### Returns

`TokenType<Token>` — a dependency bound to the token.

---

### `when(tag)`

Creates a conditional binding by the tag. For more information, see [Conditional Bindings](./conditional-bindings.md) section.

#### Arguments

1. `tag`: [`Tag`](./pointers-and-registrators.md#tag).

#### Returns

[`bind(token)`](#bindtoken) syntax.

---

### `clone()`

Returns an unlinked clone of the container.

#### Returns

`Container` — new container.

#### Example

```typescript
import { Container } from 'brandi';

const originalContainer = new Container();
const containerClone = originalContainer.clone();

expect(containerClone).toBeInstanceOf(Container);
expect(containerClone).not.toBe(originalContainer);
```

---

### `capture()`

Captures (snapshots) the current container state.

### `restore()`

Restores the [captured](#capture) container state.

#### Example

```typescript
import { Container, token } from 'brandi';

const TOKENS = {
  apiKey: token<string>('API Key'),
};

const container = new Container();
container.bind(TOKENS.apiKey).toConstant('#key9428');

container.capture();

container.bind(TOKENS.apiKey).toConstant('#testKey');

const testKey = container.get(TOKENS.apiKey);

container.restore();

const originalKey = container.get(TOKENS.apiKey);

expect(testKey).toBe('#testKey');
expect(originalKey).toBe('#key9428');
```
