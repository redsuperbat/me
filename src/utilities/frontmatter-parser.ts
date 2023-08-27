import { z } from "zod";
import YAML from "yaml";

export type Frontmatter = z.infer<typeof FrontmatterParser.schema>;

export class FrontmatterParser {
  static schema = z.object({
    authors: z.string().array().optional(),
    title: z.string().optional(),
    description: z.string().optional(),
    date: z.string(),
    position: z.number().optional().default(100),
    languages: z.string().array().default([]),
    draft: z.boolean().default(false),
  });
  #frontmatterRegex = /^---\n([\s\S]*?)\n---/;
  #parsers: ((str: string) => unknown)[] = [JSON.parse, YAML.parse];

  /**
   *
   * @description parses the frontmatter of a markdown file and returns the markdown file without the frontmatter attached
   */
  parse(markdown: string): {
    content: string;
    frontmatter: Frontmatter;
  } {
    const frontmatterString = markdown.match(this.#frontmatterRegex)?.at(1);
    if (!frontmatterString) {
      return {
        content: markdown,
        frontmatter: FrontmatterParser.schema.parse({}),
      };
    }
    const errors: Error[] = [];
    for (const parser of this.#parsers) {
      try {
        return {
          content: markdown
            .slice(markdown.match(this.#frontmatterRegex)?.at(0)?.length)
            .trim(),
          frontmatter: FrontmatterParser.schema.parse(
            parser(frontmatterString)
          ),
        };
      } catch (e) {
        errors.push(e as Error);
      }
    }
    throw new Error("unable to parse" + frontmatterString + errors.join(""));
  }
}
