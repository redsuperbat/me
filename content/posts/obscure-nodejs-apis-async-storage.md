---
title: "Obscure Node.js API:s: AsyncStorage"
date: 2023-05-01T23:21:37+01:00
draft: true
description: "Some Node.js API:s are rarely used. This article goes through the AsyncStorage API and it's use case"
keywords: ["Node.js", "Typescript", "Javascript", "js"] 
---


Everyone knows of the the common Node.js modules which are used every single day: `fs`, `path`, `http` etc. **Boooring.** Today I had the opportunity to learn about the AsyncStorage API which was new to me and was super useful for my client.

My previous client had a large typescript codebase with thousands of lines of code. The code was written primarily with `express.js` which is a Node.js http framework. ....I don't know why I explained what `express.js` is, if you don't know what `express.js` the rest of the article will more than likely be hard for you to understand. 🤷

But I digress, the architecture of the codebase was mainly a request response model where a large context object is passed around a bunch of top level functions. The context contains database connections, a logger instance, rabbitMQ connection and an `correlationId`:

```ts
import * as express from 'express';
import { rabbitMqClient } from './rabbit-mq-client.js';
import { logger } from './logger.js';
import { prisma } from './prisma.js';
import { findUsers } from './find-users.js';
import { randomUUID } from 'node:crypto';

const app = express();


app.use((req) => {
  // create a new context for every request
  req.context = {
    rabbitMqClient,
    logger,
    prisma,
    correlationId: randomUUID(),
  }
});

app.post("/", async (req,res) => {
  // pass context to top level functions
  const users = await findUsers(req.context);
  return res.json(users);
});

app.listen(3000)
```

This resulted in the context growing larger and larger when more top level utility functions were added. Eventually it made it extremely hard to test the code since functions which only depended on one field on the context still was passing the entire **damn** thing between each other. Forcing developers to mock the large context in a non type safe way. It was also a pain to refactor the context, since any change in the contexts type-definition would require changes in half the codebase at times 🥲.

This led us to refactor the code to use dependency injection for most of our 

