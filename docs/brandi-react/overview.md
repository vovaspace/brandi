---
id: overview
title: Brandi-React
sidebar_label: Overview
slug: /brandi-react
---

**Brandi-React** is the React bindings layer for Brandi.

It lets your React components get dependencies from Brandi containers.

## Installation

Brandi-React requires **React 16.8 or later**.
You'll also need to [install](../getting-started/installation.md) Brandi.

```bash
# NPM
npm install brandi-react
```

```bash
# Yarn
yarn add brandi-react
```

The Brandi-React source code is written in TypeScript but we precompile both CommonJS and ESModule builds to **ES2018**.

Additionally, we provide builds precompiled to **ESNext** by `esnext`, `esnext:main` and `esnext:module` fields.

**TypeScript** type definitions are **included** in the library and do not need to be installed additionally.

## API Reference

- [`ContainerProvider`](./container-provider.md) —
  makes the Brandi container available to any nested components that need to use injections.
- [`useInjection(token)`](./use-injection.md) — allows you to get a dependency from a container.
- [`createInjectionHooks(...tokens)`](./create-injection-hooks.md) — creates hooks for getting dependencies more easily.
- [`tagged(...tags)(Component, [options])`](./tagged.md) — attaches tags to the component and all nested components.
