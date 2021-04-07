---
id: overview
title: Overview
sidebar_label: Overview
slug: /getting-started
---

**Brandi** is a dependency injection container powered by TypeScript.

- **Framework agnostic.** Can work with any UI or server framework.
- **Lightweight and Effective.** It is tiny and designed for maximum performance.
- **Strongly typed.** TypeScript support out of box.
- **Decorators free.** Does not require additional parameters in `tsconfig.json` and `Reflect` polyfill.

## About Dependency Injection

[Dependency Injection (DI)](https://en.wikipedia.org/wiki/Dependency_injection) is a design pattern used to implement Inversion of Control (IoC).
Using DI, we move the creation and binding of the dependent objects outside of the class that depends on them.

**DI Container** is a thing that knows how to create and configure an instance of a class and its dependent objects.

## Constructor Injection

Brandi performs a [Constructor Injection](https://en.wikipedia.org/wiki/Dependency_injection#Constructor_injection) and we have no plans to add other DI types.
