---
id: container
title: Container
sidebar_label: Container
---

`Container` is a Brandi class whose instances store information about dependencies,
resolve dependencies, and inject dependencies into targets.

## `Container` Methods

### `bind(token)`

Binds the token to an implementation.

#### Arguments

1. `token`: [`Token`](./pointers-and-registrators.md#tokentdescription) — a token to be bound.

#### Returns

[Binding Type](./binding-types.md) syntax:

- [`toConstant(value)`](./binding-types.md#toconstantvalue)
- [`toInstance(creator)`](./binding-types.md#toinstancecreator)
- [`toFactory(creator, [initializer])`](./binding-types.md#tofactorycreator-initializer)

---

### `use(...tokens).from(module)`

Uses bindings from a [dependency module](./dependency-modules.md).

#### Arguments

##### `use(...tokens)`

1. `...tokens`: `Token[]` — tokens to be used from a dependency module.

##### `use(...tokens).from(module)`

1. `module`: [`DependencyModule`](./dependency-modules.md) — a dependency module.

---

### `when(condition)`

Creates a [conditional binding](./conditional-bindings.md).

#### Arguments

1. `condition`: [`Tag`](./pointers-and-registrators.md#tagdescription) | `UnknownCreator` — a condition.

#### Returns

`bind` or `use` syntax:

- [`bind(token)`](#bindtoken)
- [`use(...tokens)`](#usetokensfrommodule)

---

### `extend(container)`

Sets the parent container. For more information, see [Hierarchical Containers](./hierarchical-containers.md) section.

#### Arguments

1. `container`: `Container | null` — a `Container` or `null` that will be set as the parent container.

#### Returns

`this` — the container.

---

### `get(token)`

Gets a dependency bound to the token.

#### Arguments

1. `token`: [`TokenValue`](./pointers-and-registrators.md#tokentdescription) — token for which a dependence will be got.

#### Returns

`TokenType<TokenValue>` — a dependency bound to the token.

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

:::note

The `capture()` method works only in development mode (`process.env.NODE_ENV !== 'production'`).

`Container.capture` is `undefined` in production mode.

:::

### `restore()`

Restores the [captured](#capture) container state.

:::note

The `restore()` method works only in development mode (`process.env.NODE_ENV !== 'production'`).

`Container.restore` is `undefined` in production mode.

:::

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

---

## `createContainer()`

`createContainer()` — is alias for `new Container()`.
