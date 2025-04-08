import type { AppProps, NextWebVitalsMetric } from "next/app";
import Head from "next/head";

import "remark-github-blockquote-alert/alert.css";
import "@/styles/globals.css";

export const reportWebVitals = (metric: NextWebVitalsMetric) => {
  const body = JSON.stringify(metric);
  const url = "/api/metrics";

  if (navigator.sendBeacon) {
    navigator.sendBeacon(url, body);
  } else {
    fetch(url, { body, method: "POST", keepalive: true });
  }
};

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
