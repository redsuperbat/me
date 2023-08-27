import fs from "fs-extra";
import path from "path";
import { Frontmatter, FrontmatterParser } from "./frontmatter-parser";

export type MarkdownFile = {
  content: string;
  frontmatter: Frontmatter;
  name: string;
  base: string;
  path: string;
  chtime: string;
  firstHeader: string | null;
};

interface ToString {
  toString(): string;
}

export class MarkdownReader {
  #frontmatterParser = new FrontmatterParser();
  async read(markdownPath: string | ToString): Promise<MarkdownFile> {
    const filepath = markdownPath.toString();
    const { name, ext, base } = path.parse(filepath);
    if (ext !== ".md") {
      throw new Error("Can only read markdown files");
    }
    const rawContent = await fs.readFile(filepath, "utf-8");
    const fileStats = await fs.stat(filepath);
    const { content, frontmatter } = this.#frontmatterParser.parse(rawContent);
    const firstHeader =
      rawContent
        .split("\n")
        .find((it) => it.startsWith("# "))
        ?.slice(1)
        .trim() ?? null;
    return {
      content,
      frontmatter,
      name,
      base,
      path: filepath,
      chtime: fileStats.ctime.toISOString(),
      firstHeader,
    };
  }
  async readMany(...paths: string[]) {
    return Promise.all(paths.map((it) => this.read(it)));
  }
}
