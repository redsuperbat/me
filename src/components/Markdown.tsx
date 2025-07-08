import { toJsxRuntime } from "hast-util-to-jsx-runtime";
import type { Root } from "mdast";
import type { ReactNode } from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import dark from "react-syntax-highlighter/dist/esm/styles/prism/one-dark";
import rehypeRaw from "rehype-raw";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import { remarkAlert } from "remark-github-blockquote-alert";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { type Plugin, unified } from "unified";
import { visit } from "unist-util-visit";
import { VFile } from "vfile";
import { Anchor } from "./Anchor";

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
  const maxWidth = "min(48rem, 90vw)";
  const node = toJsxRuntime(tree, {
    Fragment,
    jsx,
    jsxs,
    components: {
      a: Anchor,
      pre: Pre,
      ul(props) {
        return <ul {...props} className="list-disc" />;
      },
      code(props) {
        const { children, className, node, legend, ...rest } = props;
        const language = className?.slice("language-".length);
        return language ? (
          <fieldset
            className="border border-gray-500 rounded-md bg-[#282c34] overflow-x-auto"
            style={{ maxWidth }}
          >
            <legend className="ml-4">{legend ?? language}</legend>
            <SyntaxHighlighter
              PreTag="div"
              customStyle={{ margin: 0, padding: "10px 0", maxWidth }}
              lineNumberStyle={{ paddingRight: "0.8rem", minWidth: "2.90rem" }}
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
