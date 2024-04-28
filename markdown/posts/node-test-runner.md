---
title: Why you might not need Jest anymore
description: Node's new test runner comes with the essentials of testing making Jest obsolete in the majority of cases. This article goes through examples of when to use the node test runner instead of a library like jest
languages:
  - Typescript
  - Javascript
date: 2023-08-26
updated: 2023-08-26
---

# Why you might not need Jest anymore

A good argument for using some new technology is always

> ”it's native” - _some 🫛 dev_

or

> ”it's included in the standard library” - _your local senior SWE_

Using code which is officially supported by the language rarely has downsides. It's pretty much guaranteed to not become outdated, it's updated when you update your language version and code from the std-library is never going to become a stale project because of open source drama (looking at you 🦀-foundation).

## import test from 'node:test';

[The node test runner](https://nodejs.org/api/test.html) is now stable since node v20.0.0. Usually I just reach for jest to run my tests but seeing how jest has had such a big problem with es-modules I reached out to the native node test runner to give it a shot. Fortunately the node:test api has been heavily inspired by jest's api making a transition quite easy. This also makes sense since jest has been the industry standard for testing in node for a while now.

## Creating a test

Creating a test in jest and node looks eerily similar:

> Jest

```ts
describe("maths", () => {
  it("should sum", () => {
    expect(1 + 2).toEqual(3);
  });
});
```

> Node

```ts
import { describe, it } from "node:test";
import assert from "node:assert";

describe("maths", () => {
  it("should sum", () => {
    assert.strictEqual(1 + 2, 3);
  });
});
```

The only major difference is the node test runner requires you to import the functions called. Which I prefer since it removes the "magic" part of creating the tests while still keeping them declarative.

## Testing async functions

Async functions are first class citizens in the node:test module:

> Jest

```ts
describe("maths", () => {
  it("should sum", async () => {
    expect(1 + 2).toEqual(3);
  });
});
```

> Node

```ts
import { describe, it } from "node:test";
import assert from "node:assert";

describe("maths", () => {
  it("should sum", async () => {
    assert.strictEqual(1 + 2, 3);
  });
});
```

The api works the same, any async function which returns a rejected promise in the `it` function is a failed test. That means this is also a failed test:

> Node

```ts
import { describe, it } from "node:test";
import assert from "node:assert";

describe("maths", () => {
  it("should sum", () => {
    return Promise.reject();
  });
});
```

## Type assertions

The node assert package also has a neat feature in that it returns the `asserts value` return type which means you will get first class typescript support in your tests.

In a typical jest test this would not narrow the type to a string even though we clearly have asserted that the type is supposed to be a string

> Jest

```ts
describe("test", () => {
  let thing: string | undefined;
  expect(typeof thing === "string");
  // Typescript still thinks this type is string | undefined
  thing;
});
```

The asserts package in node will correctly infer the narrowed type

> Node

```ts
import { describe } from "node:test";
import assert from "node:assert";

describe("test", () => {
  let thing: string | undefined;
  assert(typeof thing === "string");
  // Typescript correctly narrows this variables type to string
  thing;
});
```

## Hooks

The node api also has support for the regular lifecycle hooks jest also exposes such as `beforeAll`, `beforeEach`, `afterAll` and `afterEach` allowing you to setup and destroy resources and mocks needed for tests:

> Jest

```ts
beforeEach(() => {
  initializeDatabase();
});

afterEach(() => {
  clearDatabase();
});

beforeAll(() => initializeDatabase());

afterAll(() => clearDatabase());

describe("test", () => {
  it("should sum", async () => {
    expect(1 + 2).toEqual(3);
  });
});
```

Again, node requires you to import these lifecycle hooks from the `node:test` module

> Node

```ts
import { describe, it, before, after, beforeEach, afterEach } from "node:test";
import assert from "node:assert";

beforeEach(() => {
  initializeDatabase();
});

afterEach(() => {
  clearDatabase();
});

before(() => initializeDatabase());

after(() => clearDatabase());

describe("test", () => {
  it("should sum", async () => {
    assert.strictEqual(1 + 2, 3);
  });
});
```
