import { Anchor } from "@/components/Anchor";
import {
  CVIcon,
  GithubIcon,
  LinkedInIcon,
  NeovimIcon,
  TwitterIcon,
} from "@/components/Icons";
import { Post } from "@/components/Post";
import { cls } from "@/utilities/cls";
import { MarkdownPath } from "@/utilities/markdown-path";
import { MarkdownReader } from "@/utilities/markdown-reader";
import { glob } from "glob";
import type { InferGetStaticPropsType } from "next";
import { Share_Tech_Mono } from "next/font/google";
import type { ReactNode } from "react";

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

function Heading({ children }: { children: ReactNode }) {
  return <h2 className="text-xl font-bold">{children}</h2>;
}

export default function Home(
  props: InferGetStaticPropsType<typeof getStaticProps>,
) {
  return (
    <main
      className={cls(
        "p-3 sm:p-10 md:p-20 bg-slate-900 h-full min-h-screen text-white relative",
        font.className,
      )}
    >
      <div className="mx-auto max-w-4xl">
        <div className="gap-2 grid grid-cols-1 lg:grid-cols-header">
          <div className="flex flex-col p-5 border overflow-y-hidden h-full">
            <h1 className="sm:text-5xl text-2xl uppercase">Max Netterberg</h1>
            <small className="mb-2">Software Engineer</small>
            <p>
              Hi 👋, I'm Max! Software Engineer with a Master’s in Engineering
              and over {props.yoe} years of experience in crafting reliable and
              efficient software. I specialize in transforming complex problems
              into clean, maintainable code. Currently, my interests span
              distributed systems, Rust, TypeScript, Neovim, Golang, and
              event-driven architectures. Outside of tech, I enjoy exploring
              wine and food 🍷, golfing 🏌⛳, and climbing 🧗.
            </p>
          </div>
          <div className="flex flex-col border w-full h-full p-5 gap-2">
            <h3>Useful links ✨</h3>
            <IconLink
              text="CV"
              url="/files/max_netterberg_CV.pdf"
              icon={<CVIcon />}
            />
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
            <IconLink
              text="Neovim Config"
              url="https://github.com/redsuperbat/dotfiles"
              icon={<NeovimIcon />}
            />
          </div>
        </div>
        <div className="mt-2" />
        <Heading>Projects</Heading>
        <section className="grid gap-2 mt-2 grid-cols-1 lg:grid-cols-2">
          {props.projects
            .filter((it) => !it.frontmatter.draft)
            .map((it) => (
              <Post
                key={it.content}
                href={it.href}
                date={new Date(it.frontmatter.date)}
                languages={it.frontmatter.languages}
                title={it.firstHeader ?? it.frontmatter.title ?? ""}
                body={it.frontmatter.description}
                edited={it.frontmatter.updated}
              />
            ))}
        </section>

        <div className="mt-2" />
        <Heading>Posts</Heading>
        <section className="grid gap-2 mt-2 grid-cols-1 lg:grid-cols-2">
          {props.posts
            .filter((it) => !it.frontmatter.draft)
            .map((it) => (
              <Post
                key={it.content}
                href={it.href}
                date={new Date(it.frontmatter.date)}
                languages={it.frontmatter.languages}
                title={it.firstHeader ?? it.frontmatter.title ?? ""}
                body={it.frontmatter.description}
                edited={it.frontmatter.updated}
              />
            ))}
        </section>
      </div>
    </main>
  );
}

export const getStaticProps = async () => {
  const postsPath = new MarkdownPath().joinWith("posts/**/*.md").toString();
  const projectsPath = new MarkdownPath()
    .joinWith("projects/**/*.md")
    .toString();

  const posts = await glob(postsPath);
  const projects = await glob(projectsPath);

  const postsMarkdown = (await new MarkdownReader().readMany(...posts)).sort(
    (a, b) =>
      new Date(b.frontmatter.date).getTime() -
      new Date(a.frontmatter.date).getTime(),
  );
  const projectsMarkdown = (
    await new MarkdownReader().readMany(...projects)
  ).sort(
    (a, b) =>
      new Date(b.frontmatter.date).getTime() -
      new Date(a.frontmatter.date).getTime(),
  );

  const start = new Date("2019-11-01");
  const now = new Date();
  let yoe = now.getUTCFullYear() - start.getUTCFullYear();

  const monthsDiff = now.getUTCMonth() - start.getUTCMonth();
  const daysDiff = now.getUTCDate() - start.getUTCDate();

  if (monthsDiff < 0 || (monthsDiff === 0 && daysDiff <= 0)) {
    yoe--;
  }

  return {
    props: {
      title: "Max Netterberg | Home",
      description:
        "Max Netterberg | Software Engineer, Tinkerer, Hobby gastronomer and Maniac Programmer. Javascript, Typescript, Node.js, Golang, Rust",
      posts: postsMarkdown.map((it) => ({
        ...it,
        href: it.path.slice(new MarkdownPath().length),
      })),
      projects: projectsMarkdown.map((it) => ({
        ...it,
        href: it.path.slice(new MarkdownPath().length),
      })),
      yoe,
    },
  };
};
