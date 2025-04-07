import rehypeRaw from "rehype-raw";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Anchor } from "./Anchor";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import dark from "react-syntax-highlighter/dist/esm/styles/prism/one-dark";
import { remarkAlert } from "remark-github-blockquote-alert";

export type Props = {
  content: string;
};

export const Markdown = (props: Props) => {
  return (
    <div className="prose prose-lg sm:prose-xl dark:text-white">
      <ReactMarkdown
        rehypePlugins={[rehypeRaw]}
        remarkPlugins={[remarkAlert, remarkGfm]}
        components={{
          blockquote(props) {
            const { className, ...rest } = props;
            return (
              <blockquote
                className="dark:text-white border-l-4 dark:border-gray-500 dark:bg-gray-600 bg-gray-100 rounded-sm"
                {...rest}
              />
            );
          },
          pre(props) {
            const { className, ...rest } = props;
            return <pre className="not-prose" {...rest} />;
          },
          code(props) {
            const { children, className, node, ...rest } = props;
            const match = /language-(\w+)/.exec(className ?? "");
            return match ? (
              <fieldset className="border border-gray-500 rounded-md bg-[#282c34]">
                <legend className="ml-4">{match[1]}</legend>
                <SyntaxHighlighter
                  // 48 rem is the same as 3xl
                  customStyle={{ margin: 0, maxWidth: "48rem" }}
                  language={match[1]}
                  style={dark}
                  showLineNumbers
                >
                  {String(children).replace(/\n$/, "")}
                </SyntaxHighlighter>
              </fieldset>
            ) : (
              <code {...rest} className={className}>
                {children}
              </code>
            );
          },
          a(props) {
            return <Anchor className="no-underline" {...props} />;
          },
        }}
      >
        {props.content}
      </ReactMarkdown>
    </div>
  );
};
