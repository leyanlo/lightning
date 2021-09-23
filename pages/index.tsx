import Head from 'next/head';
import Image from 'next/image';
import * as React from 'react';
import { useInterval } from 'react-use';

const width = 64;
const height = 128;
const pTop = Math.sqrt(width) / (Math.sqrt(width) + Math.sqrt(height));
const start: [number, number] = [0, ~~(width / 2)];

enum Kind {
  Empty,
  Start,
  Path,
  Strike,
  Flash,
}

type Walls = {
  // has top wall
  top: boolean;
  // has left wall
  left: boolean;
};

type Cell = {
  walls: Walls;
} & (
  | {
      kind: Kind.Empty;
    }
  | {
      kind: Kind.Start;
    }
  | {
      kind: Kind.Path;
      // how bright the cell is, from 0 to 1, at most 25% of the height
      weight: number;
      // coordinates of the next cell towards the start
      next: [number, number];
    }
  | {
      kind: Kind.Strike;
      // coordinates of the next cell towards the start
      next: [number, number];
    }
  | {
      kind: Kind.Flash;
    }
);

// Initialize random maze. Could result in invalid maze with no solution.
function createRandomMaze(): Cell[][] {
  const maze: Cell[][] = [];
  for (let i = 0; i < height; i++) {
    maze.push([]);
    for (let j = 0; j < width; j++) {
      const top =
        // avoid closed cells
        (!maze[i - 1]?.[j].walls.top ||
          !maze[i - 1]?.[j].walls.left ||
          !maze[i - 1]?.[j + 1]?.walls.left) &&
        Math.random() < pTop;
      const left = Math.random() < 1 - pTop;
      maze[i].push({
        walls: { top, left },
        kind: Kind.Empty,
      });
    }
  }
  maze[start[0]][start[1]].kind = Kind.Start;
  return maze;
}

// Reset maze to empty except for starting cell.
function resetMaze(maze: Cell[][]): Cell[][] {
  for (let i = 0; i < maze.length; i++) {
    for (let j = 0; j < maze[i].length; j++) {
      maze[i][j] = {
        walls: maze[i][j].walls,
        kind: Kind.Empty,
      };
    }
  }
  maze[start[0]][start[1]].kind = Kind.Start;
  return maze;
}

// Generator for the path from start to strike cell. Yields lowest coordinates.
function* pathGenerator(maze: Cell[][]): Generator<[number, number]> {
  let queue = [start];
  let strike;
  while (queue.length && strike?.[0] !== height - 1) {
    const nextCells = {};
    strike = queue[0];
    for (const [r, c] of queue) {
      if (r > strike[0]) {
        strike = [r, c];
      }
      if (maze[r + 1]?.[c].kind === Kind.Empty && !maze[r + 1][c].walls.top) {
        nextCells[[r + 1, c].join()] = [r, c];
      }
      if (maze[r][c + 1]?.kind === Kind.Empty && !maze[r][c + 1].walls.left) {
        nextCells[[r, c + 1].join()] = [r, c];
      }
      if (maze[r - 1]?.[c].kind === Kind.Empty && !maze[r][c].walls.top) {
        nextCells[[r - 1, c].join()] = [r, c];
      }
      if (maze[r][c - 1]?.kind === Kind.Empty && !maze[r][c].walls.left) {
        nextCells[[r, c - 1].join()] = [r, c];
      }
    }

    const nextQueue = [];
    for (const key in nextCells) {
      const [r, c] = key.split(',').map(Number);
      maze[r][c] = {
        walls: maze[r][c].walls,
        kind: Kind.Path,
        // 100% at strike, lerp to 0 over a quarter of the height
        weight: Math.max(0, 1 - (4 * (strike[0] - r)) / height),
        next: nextCells[key],
      };
      nextQueue.push([r, c]);
    }
    queue = nextQueue;
    yield strike;
  }
}

// Generator for the strike to the start.
function* strikeGenerator(
  maze: Cell[][],
  strike: [number, number]
): Generator<[number, number]> {
  let curr = strike;
  let currCell = maze[curr[0]][curr[1]];
  let i = 0;
  while (currCell.kind === Kind.Path) {
    maze[curr[0]][curr[1]] = {
      walls: currCell.walls,
      kind: Kind.Strike,
      next: currCell.next,
    };
    i++;
    if (i % 10 === 0) {
      yield curr;
    }
    curr = currCell.next;
    currCell = maze[curr[0]][curr[1]];
  }
  if (i % 10 !== 0) {
    yield curr;
  }
}

// Generator for the flash.
function* flashGenerator(
  maze: Cell[][],
  strike: [number, number]
): Generator<[number, number]> {
  let curr = strike;
  let currCell = maze[curr[0]][curr[1]];
  while (currCell.kind === Kind.Strike) {
    maze[curr[0]][curr[1]] = {
      walls: currCell.walls,
      kind: Kind.Flash,
    };
    curr = currCell.next;
    currCell = maze[curr[0]][curr[1]];
  }
  yield curr;
}

// Infinite loop generator for the path, strike, and flash.
function* lightningGenerator(maze: Cell[][]): Generator<Kind> {
  while (true) {
    yield Kind.Start;
    let strike;
    for (strike of pathGenerator(maze)) {
      yield Kind.Path;
    }
    for (const _ of strikeGenerator(maze, strike)) {
      yield Kind.Strike;
    }
    for (const _ of flashGenerator(maze, strike)) {
      yield Kind.Flash;
    }
    resetMaze(maze);
  }
}

function createMaze(): Cell[][] {
  let maze = createRandomMaze();
  let strike;
  for (strike of pathGenerator(maze)) {
  }
  // invalid maze that does not have a path from top to bottom
  while (strike[0] < height - 1) {
    maze = createRandomMaze();
    for (strike of pathGenerator(maze)) {
    }
  }
  return resetMaze(maze);
}

export const Home = (): JSX.Element => {
  const maze = React.useMemo(() => createMaze(), []);
  const gen = React.useMemo(() => lightningGenerator(maze), []);
  const [state, setState] = React.useState({ kind: Kind.Start });

  useInterval(
    () => setState({ kind: gen.next().value }),
    {
      [Kind.Start]: 200,
      [Kind.Path]: 20,
      [Kind.Strike]: 0,
      [Kind.Flash]: 200,
    }[state.kind]
  );

  return (
    <div className="container">
      <Head>
        <title>Lightning</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <table className="maze">
          <tbody>
            {maze.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (
                  <td
                    key={j}
                    className={[
                      `wall`,
                      cell.walls.top && '-top',
                      cell.walls.left && '-left',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    <div
                      className={[
                        `cell`,
                        {
                          [Kind.Start]: '-start',
                          [Kind.Path]: '-path',
                          [Kind.Strike]: '-strike',
                          [Kind.Flash]: '-flash',
                        }[cell.kind],
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      {...(cell.kind === Kind.Path
                        ? {
                            style: {
                              '--weight': cell.weight.toFixed(2),
                            },
                          }
                        : {})}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
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
        @keyframes path {
          0% {
            background: #ffd;
          }
          100% {
            background: transparent;
          }
        }

        @keyframes flash {
          0% {
            opacity: 1;
          }
          33% {
            opacity: 0;
          }
          66% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }

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

        .maze {
          border-collapse: collapse;
        }

        .wall {
          width: 5px;
          height: 5px;
          position: relative;
        }
        .wall.-top {
          border-top: 1px solid white;
        }

        .wall.-left {
          border-left: 1px solid white;
        }

        .cell {
          position: absolute;
          top: -1px;
          left: -1px;
          width: calc(100% + 2px);
          height: calc(100% + 2px);
        }

        .cell.-start,
        .cell.-strike {
          background: #ffd;
        }

        .cell.-path {
          animation: path linear 400ms;
          opacity: var(--weight, 1);
        }

        .cell.-flash {
          background: #ffd;
          animation: flash linear 200ms;
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
