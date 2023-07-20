import type { AppProps } from "next/app";
import Head from "next/head";

import "@/styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>{pageProps.title ?? "Max Netterberg"}</title>
        <meta
          name="description"
          content={
            pageProps.description ??
            "Max Netterberg, Portfolio, Programmer, Software Engineer"
          }
          key="desc"
        />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
