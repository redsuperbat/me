---
title: Making a typescript executor
description: Making interactive presentations are fun. I created one with reveal.js and adding live code execution with a typescript transpiler and executor
languages: ["Typescript", "Dockerfile"]
date: 2023-03-22
updated: 2025-04-12
---

# Typescript Executor

A couple of months ago, I gave a presentation on TypeScript decorators. I
called it ["Demystifying Decorators"](https://redsuperbat.github.io/demystifying-decorators/), and it
focused on creating a dependency injection library in TypeScript using
decorators.

I wanted to present code in an intuitive way, especially since the audience was
primarily developers. I found a really awesome framework for creating
presentations from HTML called [Reveal](https://reveal.com).

Reveal came with a great toolkit that helped me display code and smoothly transition between slides.

Simple code like this made for a really nice slide:

```html
<section>
  <h2>Demystifying Decorators</h2>
  <p>How do <code>@Decorators()</code> really work?</p>
  <p>And what can they be used for? 🤷</p>
</section>
```

![Decorators](decorators.png)

Even though Reveal has great support for displaying code, it doesn't support
executing code live during presentations. This was something I really wanted,
as running code live can significantly enhance understanding—especially in a
very *techy* presentation like mine.

Reveal has a solid plugin system, so I started looking for a plugin that could
execute code. I found [this repo](https://github.com/stanleynguyen/reveal-run-in-terminal), which is a
plugin that exposes the terminal to run arbitrary console commands such as
`node` or `python`, allowing you to execute the code displayed in your slides.

However, it had some limitations. You have to run a command in the presentation
that points to a file containing the same code shown on the slide. Also, if I
wanted to run code that depended on external packages, I'd have to install
those packages on my machine ahead of time.

What I really wanted was the ability to press a button, run *any* code shown on
the screen, and display the standard output right in the
presentation—regardless of dependencies or whether I was using TypeScript or
JavaScript.

So, I concluded that I needed two things:

A **server** that could:
   - Accept code,
   - **Transpile** it if it's TypeScript,
   - Fetch and install any external dependencies from `npm`,
   - Execute the code, and
   - Return whatever logs were printed to standard output.

A **Reveal plugin** that could:
   - Send the content of code blocks to that server, and
   - Display the returned output in the presentation.


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

`zx` is intended to be used for scripting generally, but it really fit this use
case well since it can install dependencies with the `--install` flag. By
writing the javascript to a temporary file and pointing `zx` to that file we
are avoiding having to interpolate Javascript code into the command line.

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

The plugin needs to attach to all of the code elements in reveal.js and inject
some JavaScript which will send a http request with the code content to the
executor and then display the response.

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

