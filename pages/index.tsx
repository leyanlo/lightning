import dynamic from 'next/dynamic';
import Head from 'next/head';
import Image from 'next/image';
import * as React from 'react';

const Maze = dynamic(() => import('../components/maze'), { ssr: false });

export const Home = (): JSX.Element => {
  return (
    <div className="container">
      <Head>
        <title>Lightning</title>
        <meta name="application-name" content="Lightning" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Lightning" />
        <meta name="description" content="Lightning simulator" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#000000" />

        <link rel="apple-touch-icon" href="/icons/icon-128x128.png" />

        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/icons/icon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/icons/icon-16x16.png"
        />
        <link rel="manifest" href="/manifest.json" />
        <link rel="shortcut icon" href="/favicon.ico" />

        <meta name="twitter:card" content="summary" />
        <meta
          name="twitter:url"
          content="https://leyanlo-lightning.netlify.app/"
        />
        <meta name="twitter:title" content="Lightning" />
        <meta name="twitter:description" content="Lightning simulator" />
        <meta
          name="twitter:image"
          content="https://leyanlo-lightning.netlify.app/icons/icon-128x128.png"
        />
        <meta name="twitter:creator" content="@leyanlo" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Lightning" />
        <meta property="og:description" content="Lightning simulator" />
        <meta property="og:site_name" content="Lightning" />
        <meta
          property="og:url"
          content="https://leyanlo-lightning.netlify.app"
        />
        <meta
          property="og:image"
          content="https://leyanlo-lightning.netlify.app/icons/icon-128x128.png"
        />

        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, user-scalable=no, viewport-fit=cover"
        />
      </Head>

      <main>
        <Maze />
      </main>

      <footer>
        <a
          href="https://github.com/leyanlo/lightning"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            src="/GitHub-Mark-Light-64px.png"
            alt="GitHub Logo"
            height="32"
            width="32"
          />
        </a>
      </footer>

      <style jsx>{`
        .container {
          min-height: 100vh;
          padding: 0 0.5rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          background: black;
          color: white;
        }

        main {
          padding: 5rem 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        footer {
          width: 100%;
          height: 100px;
          border-top: 1px solid #eaeaea;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        footer img {
          margin-left: 0.5rem;
        }

        footer a {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        a {
          color: inherit;
          text-decoration: none;
        }
      `}</style>

      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
            Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
            sans-serif;
        }

        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  );
};

export default Home;
