---
title: Making a typescript executor
description: Making interactive presentations are fun. I created one with reveal.js and adding live code execution with a typescript transpiler and executor
languages: ["Typescript", "Dockerfile"]
date: 2023-03-22
updated: 2025-04-12
---

# Typescript Executor

How to execute typescript code during live coding presentations.

A couple of months ago I held a presentation regarding Typescript decorators. I called it ["Demystifying Decorators"](https://redsuperbat.github.io/demystifying-decorators/) and it's about creating a dependency injection library in typescript using decorators.

I wanted to be able to show code in an intuitive manner since the audience were mainly developers and I found this really awesome framework for creating presentations from `html` called [reveal](https://reveal.com).

Reveal had an awesome toolkit which helped me display code and transition between slides.

Simple code like this would make a really nice slide.

```html
<section>
  <h2>Demystifying Decorators</h2>
  <p>How do <code>@Decorators()</code> really work?</p>
  <p>And what can they be used for? 🤷</p>
</section>
```

![](decorators.png)
It even though reveal have awesome support for showing code it did not have support for executing that code live during presentations. This is something that I really wanted since executing code during a presentation can significantly increase understanding of the code especially since the presentation was very `techy`.

Reveal has a good plugin system so I started to look for a plugin which had the capability of executing code. I found [this](https://github.com/stanleynguyen/reveal-run-in-terminal) repo. It's a plugin to expose the terminal to run arbitrary console command such as `node` or `python` which then could run the code you had displayed.

However it has some issues, you have to run a command in the presentation pointing to a file which must contain the same code which is shown in the slide. Also if I wanted to run any code which depended on any external package I would have to install it on my machine first. I wanted to be able to press a button and run whatever code which was displayed on the screen and print the std out to the presentation screen. Regardless of dependencies or if I was presenting Typescript or JavaScript.

So I concluded I needed two things. Firstly a server which could accept code and **_transpile_** it if it was Typescript, fetch and install any external dependencies from `npm` and execute the code returning whatever logs which were printed to std out. Secondly I needed a reveal plugin which could send the text from code blocks to that server and display the text returned.

## Making the executor

To make an API which could execute typescript code and return the results we can use any http framework. I opted to use [`fastify`](https://fastify.dev/) since it's supposed to be blazingly fast 🔥.

```typescript index.ts
import cors from "@fastify/cors";
import init from "fastify";
const fastify = init({ logger: true, requestTimeout: 60_000 });

fastify.post("/", async (req, _) => {
  const tsCode = String(req.body);
});

const start = async () => {
  try {
    await fastify.register(cors);
    await fastify.listen({ port: 3000, host: "0.0.0.0" });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
```

Since we want to be able to send Typescript code we have to transpile the code, this can be done with the `typescript` package:

```typescript index.ts
import { transpile, ModuleKind, ScriptTarget } from "typescript";

const js = transpile(tsCode, {
  experimentalDecorators: true,
  emitDecoratorMetadata: true,
  module: ModuleKind.ES2015,
  target: ScriptTarget.ES2015,
});
```

The executor should also be able to download arbitrary dependencies declared in the code. There is a great library which is made by Google called [`zx`](https://GitHub.com/google/zx) which can help us with that:

```typescript index.ts
import { exec } from "child_process";
import { randomUUID } from "crypto";
import { rm, writeFile } from "fs/promises";

function cmd(command: string) {
  let p = exec(command);
  return new Promise<string>((res) => {
    let stdout = "";
    const append = (data: any) => {
      data = data.toString() as string;
      if (data.includes(" npm i ")) return;
      stdout += data;
    };
    p.stdout?.on("data", append);
    p.stderr?.on("data", append);
    p.on("exit", () => {
      res(stdout.trim());
    });
  });
}

const filename = randomUUID();
await writeFile(filename, js);
try {
  const output = await cmd(`zx --install --quiet ./${filename}`);
  console.log(output);
  return output;
} finally {
  await rm(filename);
}
```

`zx` is intended to be used for scripting generally, but it really fit this use case well since it can install dependencies with the `--install` flag. By writing the javascript to a temporary file and pointing `zx` to that file we are avoiding having to interpolate Javascript code into the command line.

Great! Now we can package this app up with Docker and run it in a container for easy management.

```Dockerfile
FROM node as builder

WORKDIR /app

COPY package*.json .

RUN npm install

COPY . .

RUN npm run build

FROM node as runner

WORKDIR /app

RUN npm install -g zx

COPY --from=builder /app/node_modules node_modules

COPY --from=builder /app/index.js index.js

CMD [ "node", "index.js" ]
```

## Making the plugin

The plugin needs to attach to all of the code elements in reveal.js and inject some JavaScript which will send a http request with the code content to the executor and then display the response.

```javascript reveal-code-exec.js
window.RevealCodeExec = ({ execUrl }) => ({
  id: "code-exec",
  init: () => {
    const codeblocks = document.querySelectorAll("pre.code-wrapper[runnable]");
    for (const code of codeblocks) {
      const runTheCode = "Run the code!";
      const div = document.createElement("div");
      code.contentEditable = "true";
      code.style.position = "relative";
      div.style.cursor = "pointer";
      div.style.width = "100%";
      div.style.zIndex = "10";
      div.style.top = "100%";
      div.style.bottom = "0";
      div.style.background = "white";
      div.style.position = "absolute";
      div.innerText = runTheCode;
      div.style.height = "fit-content";
      div.onclick = async () => {
        if (div.innerText !== runTheCode) {
          return (div.innerText = runTheCode);
        }
        div.innerText = "Loading...";
        const body = (
          code.querySelector("code.visible.current-fragment") ||
          code.querySelector("code")
        ).textContent;
        const res = await fetch(execUrl, {
          method: "POST",
          body,
        });
        if (!res.ok) {
          div.innerText = runTheCode;
          return;
        }
        const text = await res.text();
        div.innerText = text || runTheCode;
      };
      code.appendChild(div);
    }
  },
});
```

We attach a function to the global window object and register it as a plugin in `index.html`

```html
<script src="plugin/code-exec/plugin.js"></script>
<script>
  Reveal.initialize({
    hash: true,
    plugins: [
      RevealMarkdown,
      RevealHighlight,
      RevealNotes,
      RevealCodeExec({ execUrl: "http://localhost:8080" }),
    ],
  });
</script>
```

Now we should be able to run the code in the presentation by pressing the `Run the code!` button

![console-log.png](console-log.png)

Pressing the button yields this result:

![console-log-result.png](console-log-result.png)

## Conclusion

If you made it this far, thanks for sticking along and hope your learned something new.

Another cool thing about using reveal is that you can embed the presentation in an iframe. Below is an example of that 👇

<iframe style="width: 100%; height: 400px;" src="https://redsuperbat.github.io/demystifying-decorators/#/1">
</iframe>

Happy coding! 🌈

