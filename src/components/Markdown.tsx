import { cls } from "@/utilities/cls";
import { kebabCase } from "lodash";
import { Children, ReactNode, createElement, isValidElement } from "react";
import ReactMarkdown from "react-markdown";
import { type HeadingComponent } from "react-markdown/lib/ast-to-react";
import rehypePrism from "rehype-prism-plus";
import remarkGfm from "remark-gfm";
import { Anchor } from "./Anchor";

export type Props = {
  content: string;
};

const Heading: HeadingComponent = (props) => {
  function getTextFromReactNode(node: ReactNode): string {
    if (typeof node === "string") {
      return node;
    }

    if (isValidElement(node)) {
      let text = "";
      Children.forEach(node.props.children, (child) => {
        text += getTextFromReactNode(child);
      });
      return text;
    }

    return "";
  }

  const slug = getTextFromReactNode(<h1 {...props}></h1>);
  const id = kebabCase(slug);
  const Element = (elProps: { className: string }) =>
    createElement(
      "h" + props.level.toString(),
      { id, className: elProps.className, after: " #" },
      props.children
    );
  return (
    <>
      <Element
        className={cls(
          props.className,
          "dark:text-white dark:after:text-white after:content-[attr(after)] after:opacity-0 hover:after:opacity-100 after:cursor-pointer after:transition-opacity"
        )}
      />
    </>
  );
};

export const Markdown = (props: Props) => {
  return (
    <ReactMarkdown
      className="prose-lg sm:prose-xl dark:text-white"
      rehypePlugins={[
        function () {
          return rehypePrism.call(this, {
            showLineNumbers: true,
            ignoreMissing: true,
          });
        },
      ]}
      remarkPlugins={[remarkGfm]}
      components={{
        h1: Heading,
        h2: Heading,
        h3: Heading,
        h4: Heading,
        h5: Heading,
        h6: Heading,
        blockquote(props) {
          const { className, ...rest } = props;
          return (
            <blockquote
              className="[&>p]:before:content-none [&>p]:after:content-none dark:text-white border-l-4 dark:border-gray-500 dark:bg-gray-600 bg-gray-100 rounded"
              {...rest}
            ></blockquote>
          );
        },
        pre(props) {
          const { className, ...rest } = props;
          return (
            <pre className={cls(className, "max-w-[90vw]")} {...rest}></pre>
          );
        },
        code(props) {
          const { className, ...rest } = props;
          if (className?.includes("code-highlight")) {
            return <code className={cls(className)} {...rest}></code>;
          }
          return (
            <code
              className="after:content-none before:content-none font-semibold bg-gray-200 dark:bg-gray-600 px-[6px] py-[1px] rounded-md dark:text-white "
              {...rest}
            ></code>
          );
        },
        a(props) {
          return <Anchor className="no-underline" {...props} />;
        },
      }}
    >
      {props.content}
    </ReactMarkdown>
  );
};
