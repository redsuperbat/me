import { MarkdownPath } from "@/utilities/markdown-path";
import type { GetServerSideProps } from "next";
import fs from "fs-extra";

const BASE_URL = "https://max.netterberg.io/posts";

function generateSiteMap(posts: { id: string }[]) {
  const postsXml = posts
    .map(({ id }) => `<url>\n<loc>${`${BASE_URL}/${id}`}</loc>\n</url>`)
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://max.netterberg.io</loc>
  </url>
  ${postsXml}
</urlset>
 `;
}

function SiteMap() {
  // getServerSideProps will do the heavy lifting
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const path = new MarkdownPath().joinWith("posts");
  const ids = await fs.readdir(path.toString());

  const sitemap = generateSiteMap(ids.map((it) => ({ id: it })));
  res.setHeader("Content-Type", "text/xml");
  res.write(sitemap);
  res.end();

  return {
    props: {},
  };
};

export default SiteMap;
