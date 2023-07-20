import { Anchor } from "@/components/Anchor";
import { GithubIcon, LinkedInIcon, TwitterIcon } from "@/components/Icons";
import { Post } from "@/components/Post";
import { cls } from "@/utilities/cls";
import { MarkdownPath } from "@/utilities/markdown-path";
import { MarkdownReader } from "@/utilities/markdown-reader";
import { glob } from "glob";
import { InferGetStaticPropsType } from "next";
import { Share_Tech_Mono } from "next/font/google";
import Image from "next/image";
import { ReactNode } from "react";

const font = Share_Tech_Mono({ weight: "400", subsets: ["latin"] });

const IconLink = ({
  url,
  text,
  icon,
}: {
  url: string;
  text: string;
  icon: ReactNode;
}) => {
  return (
    <Anchor href={url} target="_blank">
      <span className="flex items-end gap-2">
        {icon}
        <span>{text}</span>
      </span>
    </Anchor>
  );
};

export default function Home(
  props: InferGetStaticPropsType<typeof getStaticProps>
) {
  return (
    <main
      className={cls(
        "p-3 sm:p-10 md:p-20 dark:bg-slate-900 h-full min-h-screen dark:text-white relative",
        font.className
      )}
    >
      <div className="w-full max-w-7xl">
        <div className="flex sm:flex-row flex-col items-center sm:items-start gap-2 sm:h-64">
          <Image
            priority
            src="/images/max.jpeg"
            height={250}
            width={250}
            alt="Max Netterberg"
            className="hidden lg:block w-64 h-64"
          />
          <div className="flex flex-col p-5 border overflow-y-scroll h-full">
            <h1 className="sm:text-6xl text-2xl uppercase">Max Netterberg</h1>
            <small className="mb-2">
              Software Engineer, Tinkerer, Hobby gastronomer and Maniac
              Programmer
            </small>
            <p>
              Hi, I'm Max. I post stuff here about tech. This page acts as a
              forum for me to add posts of varying quality. If you you wonder
              how it's made check out my{" "}
              <Anchor href="https://github.com/redsuperbat/me">github</Anchor>{" "}
              where I host the code for this site. Right now my interests
              include Distributed systems programming, Rust, Typescript, golang,
              Event driven architectures, Wine & Food 🍷 and Golf 🏌️‍♂️⛳️.
            </p>
          </div>
          <div className="flex flex-col border w-full h-full p-5 gap-2">
            <small>You can find me in these places 👇</small>
            <IconLink
              text="Github"
              url="https://github.com/redsuperbat"
              icon={<GithubIcon />}
            />
            <IconLink
              text="Twitter"
              url="https://twitter.com/netterbergmax"
              icon={<TwitterIcon />}
            />
            <IconLink
              text="LinkedIn"
              url="https://www.linkedin.com/in/max-netterberg"
              icon={<LinkedInIcon />}
            />
          </div>
        </div>
        <section
          className="grid gap-2 mt-2"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          }}
        >
          {props.markdown.map((it) => (
            <Post
              key={it.content}
              href={it.href}
              date={new Date(it.frontmatter.date!)}
              languages={it.frontmatter.languages}
              title={it.firstHeader!}
              body={it.frontmatter.description}
            />
          ))}
        </section>
      </div>
    </main>
  );
}

export const getStaticProps = async () => {
  const markdownPath = new MarkdownPath();
  const homeFilePath = markdownPath
    .clone()
    .joinWith("posts/**/*.md")
    .toString();

  const posts = await glob(homeFilePath);

  const markdown = await new MarkdownReader().readMany(...posts);

  return {
    props: {
      title: "Max Netterberg | Home",
      description:
        "Max Netterberg | Software Engineer, Tinkerer, Hobby gastronomer and Maniac Programmer. Javascript, Typescript, Node.js, Golang, Rust",
      markdown: markdown.map((it) => ({
        ...it,
        href: it.path.slice(markdownPath.length),
      })),
    },
  };
};
