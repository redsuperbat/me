import { Markdown } from "@/components/Markdown";
import { MarkdownPath } from "@/utilities/markdown-path";
import { MarkdownReader } from "@/utilities/markdown-reader";
import { glob } from "glob";
import {
  GetStaticPaths,
  GetStaticPropsContext,
  InferGetStaticPropsType,
} from "next";

export default function PostsPage(
  props: InferGetStaticPropsType<typeof getStaticProps>,
) {
  return (
    <main className="dark:bg-slate-900 p-5 sm:p-10 md:p-20 w-screen min-h-screen">
      <div className="max-w-3xl mx-auto">
        <Markdown content={props.markdown.content} />
      </div>
    </main>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const markdownPath = new MarkdownPath();
  const path = markdownPath.clone().joinWith("projects/**/*.md");
  const paths = await glob(path.toString());

  return {
    paths: paths.map((it) => it.slice(markdownPath.length)),
    fallback: false,
  };
};

export const getStaticProps = async (context: GetStaticPropsContext) => {
  const id = context.params?.id as string;
  const path = new MarkdownPath().joinWith("projects", id);
  const markdown = await new MarkdownReader().read(path);

  return {
    props: {
      title: `Posts - ${markdown.frontmatter.title ?? id}`,
      description: markdown.frontmatter.description ?? `${id}`,
      markdown,
    },
  };
};
