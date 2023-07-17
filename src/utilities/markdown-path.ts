import path from "path";

export class MarkdownPath {
  #path = path.join(process.cwd(), "markdown");

  joinWith(withPath: string): MarkdownPath {
    this.#path = path.join(this.#path, withPath);
    return this;
  }

  toString(): string {
    return this.#path;
  }
}
