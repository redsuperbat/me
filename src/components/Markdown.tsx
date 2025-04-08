import remarkGfm from "remark-gfm";
import type { ReactNode } from "react";
import { Anchor } from "./Anchor";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import dark from "react-syntax-highlighter/dist/esm/styles/prism/one-dark";
import { remarkAlert } from "remark-github-blockquote-alert";
import { unified, type Plugin } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import rehypeRaw from "rehype-raw";
import { toJsxRuntime } from "hast-util-to-jsx-runtime";
import { VFile } from "vfile";
import { visit } from "unist-util-visit";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import type { Root } from "mdast";

export type Props = {
  content: string;
};

const remarkCodeLegend: Plugin<[], Root> = () => (tree) =>
  visit(tree, "code", (node) => {
    const meta = node.meta;
    if (typeof meta !== "string") return;
    node.data ??= {};
    node.data.hProperties ??= {};
    node.data.hProperties.legend = meta;
  });

const processor = unified()
  .use(remarkParse)
  .use(remarkCodeLegend)
  .use(remarkGfm)
  .use(remarkAlert)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeRaw)
  .use(rehypeStringify);

function Pre({ children }: { children: ReactNode }) {
  return <pre className="not-prose">{children}</pre>;
}

export const Markdown = (props: Props) => {
  const file = new VFile(props.content);
  const tree = processor.runSync(processor.parse(file));
  const node = toJsxRuntime(tree, {
    Fragment,
    jsx,
    jsxs,
    components: {
      a: Anchor,
      pre: Pre,
      code(props) {
        const { children, className, node, legend, ...rest } = props;
        const language = className?.slice("language-".length);
        return language ? (
          <fieldset className="border border-gray-500 rounded-md bg-[#282c34]">
            <legend className="ml-4">{legend ?? language}</legend>
            <SyntaxHighlighter
              customStyle={{ margin: 0, maxWidth: "min(42rem, 90vw)" }}
              language={language}
              style={dark}
              showLineNumbers
            >
              {String(children).replace(/\n$/, "")}
            </SyntaxHighlighter>
          </fieldset>
        ) : (
          <span
            {...rest}
            className="text-gray-200 p-1 px-2 bg-gray-600 rounded-md"
          >
            {children}
          </span>
        );
      },
    },
  });

  return (
    <div className="prose-lg prose-headings:text-white text-white">{node}</div>
  );
};
