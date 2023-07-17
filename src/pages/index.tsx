import { Anchor } from "@/components/Anchor";
import { Post } from "@/components/Post";
import { cls } from "@/utilities/cls";
import { MarkdownPath } from "@/utilities/markdown-path";
import { MarkdownReader } from "@/utilities/markdown-reader";
import { glob } from "glob";
import { InferGetStaticPropsType } from "next";
import { Share_Tech_Mono } from "next/font/google";
import Head from "next/head";
import Image from "next/image";

const font = Share_Tech_Mono({ weight: "400", subsets: ["latin"] });

export default function Home(
  props: InferGetStaticPropsType<typeof getStaticProps>
) {
  return (
    <>
      <Head>
        <title>Max Netterberg</title>
      </Head>
      <main className={cls("p-10 sm:p-20", font.className)}>
        <div className="flex sm:flex-row flex-col items-center sm:items-start">
          <Image
            src="/images/max.jpeg"
            height={250}
            width={250}
            alt="Max Netterberg"
            className="hidden sm:block"
          />
          <div className="flex flex-col p-5 border sm:ml-2 sm:h-64 h-[340px] overflow-y-scroll">
            <h1 className="sm:text-7xl text-2xl uppercase">Max Netterberg</h1>
            <small>
              Software Engineer, Tinkerer, Hobby gastronomer and Maniac
              Programmer
            </small>
            <p>
              Hi I'm Max, this is my blog. I post stuff here about tech
              generally. This page acts as a forum for me to add posts of
              varying quality. If you you wonder how it's made check out my{" "}
              <Anchor href="https://github.com/redsuperbat/me">github</Anchor>{" "}
              where I host the code for this site. Right now my interests
              include Distributed systems programming, Rust, Typescript, golang,
              Event driven architectures, Wine & Food 🍷. Generally you can find
              my on my{" "}
              <Anchor href="https://github.com/redsuperbat">Github</Anchor>,{" "}
              <Anchor href="https://www.linkedin.com/in/max-netterberg">
                LinkedIn
              </Anchor>{" "}
              or{" "}
              <Anchor href="https://twitter.com/netterbergmax">Twitter</Anchor>.
            </p>
          </div>
        </div>
        <section
          className="grid gap-4 mt-5"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          }}
        >
          {props.markdown.map((it) => (
            <Post
              key={it.name}
              date={new Date(it.frontmatter.date!)}
              languages={it.frontmatter.languages}
              title={it.firstHeader!}
              body={it.frontmatter.description}
            />
          ))}
        </section>
      </main>
    </>
  );
}

export const getStaticProps = async () => {
  const homeFilePath = new MarkdownPath().joinWith("posts/**/*.md").toString();
  const posts = await glob(homeFilePath);

  const markdown = await new MarkdownReader().readMany(...posts);
  console.log(markdown);

  return {
    props: {
      markdown,
    },
  };
};
