---
id: installation
title: Installation
sidebar_label: Installation
---

Brandi is available as a package for use with a module bundler or in a Node application.

```bash
# NPM
npm install brandi
```

```bash
# Yarn
yarn add brandi
```

The Brandi source code is written in TypeScript but we precompile both CommonJS and ESModule builds to **ES2018**.

Additionally, we provide builds precompiled to **ESNext** by `esnext`, `esnext:main` and `esnext:module` fields.

## TypeScript

TypeScript type definitions are **included** in the library and do not need to be installed additionally.

## No Dependencies

Brandi has no dependencies, but requires the following globals in order to work:

- `Symbol`
- `WeakMap`

## Production

By default, Brandi will be in development mode. The development mode includes warnings about common mistakes
and `capture()/restore()` `Container` methods.

Don't forget to set `process.env.NODE_ENV` to `production` when deploying your application.

## Brandi-React

[**Brandi-React**](../brandi-react/overview.md) is the React bindings layer for Brandi.

It lets your React components get dependencies from Brandi containers.

```bash
# NPM
npm install brandi-react
```

```bash
# Yarn
yarn add brandi-react
```
