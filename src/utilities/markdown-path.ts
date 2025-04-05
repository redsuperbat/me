import path from "node:path";
import util from "node:util";

export class MarkdownPath {
  #path = path.join(process.cwd(), "markdown");

  static fromPath(path: string): MarkdownPath {
    const markdownPath = new MarkdownPath();
    markdownPath.#path = path;
    return markdownPath;
  }

  joinWith(...withPaths: string[]): MarkdownPath {
    this.#path = path.join(this.#path, ...withPaths);
    return this;
  }

  clone(): MarkdownPath {
    return MarkdownPath.fromPath(this.#path);
  }

  toString(): string {
    return this.#path;
  }

  get length() {
    return this.#path.length;
  }

  [util.inspect.custom]() {
    return this.#path.toString();
  }
}
