---
id: react-examples
title: React Examples
sidebar_label: React Examples
slug: /react-examples
---

A minimalist React App example.

## Creating Services

First, we'll create a wrapper service around the browser LocalStorage API.

<!-- prettier-ignore-start -->
```typescript
class LocalStorageService {
  has(key: string) {
    return !!window.localStorage.getItem(key);
  }

  get(key: string) {
    const value = window.localStorage.getItem(key);
    return typeof value === "string" ? JSON.parse(value) : null;
  }

  set(key: string, value: any) {
    value = JSON.stringify(value);
    window.localStorage.setItem(key, value);
  }

  delete(key: string) {
    window.localStorage.removeItem(key);
  }

  clear() {
    window.localStorage.clear();
  }
}

```
<!-- prettier-ignore-end --->

Then, a service containing our business logic (a simple counter for the purpose of demonstration). This service depends on the previous one, so we _inject_ it in its constructor.

<!-- prettier-ignore-start -->
```typescript
class CounterService {
  private _key = "counter_current";
  private _number = 0;

  constructor(public storage: LocalStorageService) {
    if (this.storage.has(this._key)) {
      this._number = this.storage.get(this._key);
    }
  }

  get current() {
    return this._number;
  }

  start(from = 0) {
    this._number = from;
    this.storage.set(this._key, this._number);
  }

  increment(step = 1) {
    this._number += step;
    this.storage.set(this._key, this._number);
    return this._number;
  }

  decrement(step = 1) {
    this._number -= step;
    this.storage.set(this._key, this._number);
    return this._number;
  }
}
```
<!-- prettier-ignore-end --->

## Binding services to a container

**Binding types** and **scopes** are detailed in [Binding Types](../reference/binding-types.md)
and [Binding Scopes](../reference/binding-scopes.md) sections of the documentation.

This is similar for any library, and even Vanilla JavaScript.

<!-- prettier-ignore-start -->
```typescript
import { token, injected, Container } from "brandi";
import CounterService from "./CounterService";
import LocalStorageService from "./LocalStorageService";

const TOKENS = {
  counterService: token<CounterService>("CounterService"),
  localStorageService: token<LocalStorageService>("LocalStorageService")
};

/* ↓ Tell Brandi which of our services depends on which other. */
injected(CounterService, TOKENS.localStorageService);

const container = new Container();
container
  .bind(TOKENS.counterService)
  .toInstance(CounterService)
  .inTransientScope();
container
  .bind(TOKENS.localStorageService)
  .toInstance(LocalStorageService)
  .inTransientScope();

export default container;
```
<!-- prettier-ignore-end -->

## Setting the provider

`brandi-react` provides a helpful context provider for a container, let's create one at the root of our application.

<!-- prettier-ignore-start -->
```typescript
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ContainerProvider } from "brandi-react";

import App from "./App";
import container from "./container.ts";

const rootElement = document.getElementById("root");
const root = createRoot(rootElement!);

root.render(
    <StrictMode>
        <ContainerProvider container={container}>
          <App />
      </ContainerProvider>
    </StrictMode>
);
```
<!-- prettier-ignore-end -->

## Getting services instances in components

`brandi-react` also provides a custom hook to access our services from our components. 

<!-- prettier-ignore-start -->
```typescript
import { useState } from "react";
import { useInjection } from "brandi-react";

import TOKENS from "./tokens";

export default function App() {
  const counterService = useInjection(TOKENS.counterService);
  /*                        ↓ State Hook allow to trigger re-renders from React */ 
  const [value, setValue] = useState(counterService.current);

  return (
    <div className="App">
      <h1>Hello Brandi</h1>
      <button onClick={() => setValue(counterService.decrement())}>-</button>
      <span>{value}</span>
      <button onClick={() => setValue(counterService.increment())}>+</button>
    </div>
  );
}
```
<!-- prettier-ignore-end -->

Whether the service is a new instance or a global depends on the **scopes** defined in the previous steps. See the [Binding Scopes](../reference/binding-scopes.md) section of the documentation.

## Testing

We'll use [Jest](https://jestjs.io/) and [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) to test our `CounterService` in integration with our component.

Since these tests run in a [Node.js](https://nodejs.org) environment, we don't have access to the LocalStorage API. So we'll resort to mock the `LocalStorageService` module.

<!-- prettier-ignore-start -->
```typescript
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { JSXElementConstructor, PropsWithChildren } from "react";
import userEvent from "@testing-library/user-event";
import { UserEvent } from "@testing-library/user-event/dist/types/setup/setup";
import { Container } from "brandi";
import { ContainerProvider } from "brandi-react";

import App from "./App";
import TOKENS from "./tokens";
import CounterService from "./CounterService";
import LocalStorageService from "./LocalStorageService";

jest.mock("./LocalStorageService");

describe("The App component", () => {
    /*  ↓ Keeps a reference of the mocked dependency in scope of our tests. */
    let storageMock: jest.Mocked<LocalStorageService>,
    container: Container,
    wrapper: JSXElementConstructor<PropsWithChildren<{}>>,
    user: UserEvent;

  beforeEach(() => {
    storageMock = new LocalStorageService() as jest.Mocked<LocalStorageService>;

    container = new Container();
    
    container
        .bind(TOKENS.localStorageService)
        /* ↓ Uses the referenced mock instead of new instances. */
        .toConstant(storageMock);
    container
      .bind(TOKENS.counterService)
      /* ↓ Creates a new instance, which will get our mock as injected dependency. */
      .toInstance(CounterService) 
      .inTransientScope();

    /* ↓ Define a new wrapper to keep tests isolated. */
    wrapper = ({ children }) => (
        <ContainerProvider container={container}>
            {children}
        </ContainerProvider>
    );

    user = userEvent.setup();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

    // ... tests go here ...
});
```
<!-- prettier-ignore-end -->

Then we'll use the mocked service to set some fixtures, and spy on its methods.

<!-- prettier-ignore-start -->
```typescript
  it("loads the value from the storage service on mount", () => {
    storageMock.has.mockImplementationOnce(() => true)
    storageMock.get.mockImplementationOnce(() => 3)

    render(<App />, { wrapper });

    expect(storageMock.get).toHaveBeenCalledTimes(1)
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("writes the new value in the storage when user clicks the increment button", async () => {
    render(<App />, { wrapper });

    expect(screen.getByText("0")).toBeInTheDocument();

    const incrementButton = screen.getByRole("button", { name: "+" });
    await user.click(incrementButton);

    expect(storageMock.set).toHaveBeenCalledWith(expect.any(String), 1);
  });
```
<!-- prettier-ignore-end -->