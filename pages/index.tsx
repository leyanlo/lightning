import Head from 'next/head';
import Image from 'next/image';

const width = 64;
const height = 128;
const pTop = Math.sqrt(width) / (Math.sqrt(width) + Math.sqrt(height));
const grid = [];
for (let i = 0; i < height; i++) {
  grid.push([]);
  for (let j = 0; j < width; j++) {
    const top =
      // avoid closed cells
      (!grid[i - 1]?.[j][0] ||
        !grid[i - 1]?.[j][3] ||
        !grid[i - 1]?.[j + 1]?.[3]) &&
      Math.random() < pTop;
    const left = Math.random() < 1 - pTop;
    grid[i].push([top, false, false, left]);
  }
}

export const Home = (): JSX.Element => (
  <div className="container">
    <Head>
      <title>Lightning</title>
      <link rel="icon" href="/favicon.ico" />
    </Head>

    <main>
      <table className="grid">
        {grid.map((row, i) => (
          <tr key={i}>
            {row.map((cell, j) => (
              <td
                key={j}
                className={[`cell`, cell[0] && '-top', cell[3] && '-left']
                  .filter(Boolean)
                  .join(' ')}
              />
            ))}
          </tr>
        ))}
      </table>
    </main>

    <footer>
      <a
        href="https://github.com/leyanlo/lightning"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Image
          src="/GitHub-Mark-Light-32px.png"
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

      .grid {
        border-collapse: collapse;
      }

      .cell {
        width: 10px;
        height: 10px;
        border-width: 0;
        border-style: solid;
        border-color: white;
      }

      .cell.-top {
        border-top-width: 1px;
      }

      .cell.-left {
        border-left-width: 1px;
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
        font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen,
          Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
      }

      * {
        box-sizing: border-box;
      }
    `}</style>
  </div>
);

export default Home;
