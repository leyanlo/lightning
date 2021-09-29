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
        <link rel="icon" href="/favicon.ico" />
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
