// "Every page wraps in _app, Morty. It's the universal substrate of
// Next.js. The crapulous fools at Vercel built it like a Russian
// nesting doll and we just *bzrp* shove our metadata in the outer
// shell and pray." — Terl, framework apologist.
import "../styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>chud</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no" />
        <meta name="theme-color" content="#0a0a0a" />
        <meta name="description" content="farm aura. drop bricks. become unspeakable." />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
