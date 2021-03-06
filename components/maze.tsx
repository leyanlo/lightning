import * as React from 'react';

const width = 64;
const height = 128;
// Probability of a horizontal wall in the maze. Tends to 1 as maze gets wider, and 0 as maze gets taller.
const pTop = Math.sqrt(width) / (Math.sqrt(width) + Math.sqrt(height));
const start: [number, number] = [0, ~~(width / 2)];

enum Kind {
  Empty,
  Start,
  Path,
  Strike,
  Done,
}

type Walls = {
  // has top wall
  top: boolean;
  // has left wall
  left: boolean;
};

const kindToClassModifier: { [Property in Kind]: string | null } = {
  [Kind.Empty]: null,
  [Kind.Start]: '-start',
  [Kind.Path]: '-path',
  [Kind.Strike]: '-strike',
  [Kind.Done]: null,
};

const kindToTimeoutMs: { [Property in Kind]: number | null } = {
  [Kind.Empty]: null,
  [Kind.Start]: 200,
  [Kind.Path]: 20,
  [Kind.Strike]: 0,
  [Kind.Done]: 1000,
};

class Cell {
  private readonly _walls: Walls;

  private _kind: Kind;
  // coordinates of the next cell towards the start
  private _next?: [number, number];
  // how bright the cell is, from 0.00 to 1.00, at most 25% of the height
  private _weight?: string;

  public wallsClassName: string;
  public cellClassName: string;

  private _updateWallsClassName() {
    this.wallsClassName = [
      `wall`,
      this._walls.top && '-top',
      this._walls.left && '-left',
    ]
      .filter(Boolean)
      .join(' ');
  }

  private _updateCellClassName() {
    this.cellClassName = [`cell`, kindToClassModifier[this._kind]]
      .filter(Boolean)
      .join(' ');
  }

  constructor({ walls, kind }) {
    this._walls = walls;
    this._kind = kind;
    this._updateWallsClassName();
    this._updateCellClassName();
  }

  public get walls() {
    return this._walls;
  }

  public get kind() {
    return this._kind;
  }

  public get next() {
    return this._next;
  }

  public get weight() {
    return this._weight;
  }

  public update(
    props:
      | {
          kind: Kind.Empty;
        }
      | {
          kind: Kind.Start;
        }
      | {
          kind: Kind.Path;
          // how bright the cell is, from 0.00 to 1.00, at most 25% of the height
          weight: string;
          // coordinates of the next cell towards the start
          next: [number, number];
        }
      | {
          kind: Kind.Strike;
        }
  ) {
    this._kind = props.kind;
    this._weight = props.kind === Kind.Path ? props.weight : undefined;
    this._next = props.kind === Kind.Path ? props.next : undefined;
    this._updateCellClassName();
  }
}

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
      maze[i].push(
        new Cell({
          walls: { top, left },
          kind: Kind.Empty,
        })
      );
    }
  }
  maze[start[0]][start[1]].update({ kind: Kind.Start });
  return maze;
}

// Reset maze to empty except for starting cell.
function resetMaze(maze: Cell[][]): Cell[][] {
  for (let i = 0; i < maze.length; i++) {
    for (let j = 0; j < maze[i].length; j++) {
      maze[i][j].update({ kind: Kind.Empty });
    }
  }
  maze[start[0]][start[1]].update({ kind: Kind.Start });
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
      maze[r][c].update({
        kind: Kind.Path,
        // 100% at strike, lerp to 0 over a quarter of the height
        weight: Math.max(0, 1 - (4 * (strike[0] - r)) / height).toFixed(2),
        next: nextCells[key],
      });
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
    const { next } = currCell;
    maze[curr[0]][curr[1]].update({ kind: Kind.Strike });
    i++;
    if (i % 10 === 0) {
      yield curr;
    }
    curr = next;
    currCell = maze[curr[0]][curr[1]];
  }
  if (i % 10 !== 0) {
    yield curr;
  }
}

// Infinite loop generator for the path and strike.
function* lightningGenerator(maze: Cell[][]): Generator<Kind> {
  while (true) {
    yield Kind.Start;
    let strike = start;
    for (strike of pathGenerator(maze)) {
      yield Kind.Path;
    }
    for (const _ of strikeGenerator(maze, strike)) {
      yield Kind.Strike;
    }
    yield Kind.Done;
    resetMaze(maze);
  }
}

// Initialize maze. Will keep trying random mazes until it finds a valid maze.
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

export function Maze(): JSX.Element {
  const maze = React.useMemo(() => createMaze(), []);
  const gen = React.useMemo(() => lightningGenerator(maze), [maze]);
  const kindRef = React.useRef(Kind.Start);
  const start = React.useMemo(() => performance.now(), []);
  const prevTimestampRef = React.useRef(start);
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0);

  const step = React.useCallback(
    (timestamp) => {
      if (
        timestamp - prevTimestampRef.current >
        kindToTimeoutMs[kindRef.current]
      ) {
        prevTimestampRef.current = timestamp;
        kindRef.current = gen.next().value;
        forceUpdate();
      }
      requestAnimationFrame(step);
    },
    [gen]
  );

  // start the loop
  React.useEffect(() => {
    requestAnimationFrame(step);
  }, [step]);

  return (
    <table className="maze">
      <tbody>
        {maze.map((row, i) => (
          <tr key={i}>
            {row.map((cell, j) => (
              <td key={j} className={cell.wallsClassName}>
                <div
                  className={cell.cellClassName}
                  style={{ '--weight': cell.weight }}
                />
              </td>
            ))}
          </tr>
        ))}
      </tbody>

      <style jsx>{`
        @keyframes path {
          0% {
            background: #ffd;
          }
          100% {
            background: transparent;
          }
        }

        .maze {
          border-collapse: collapse;
        }

        .wall {
          width: 5px;
          height: 5px;
          position: relative;
        }

        @media screen and (min-width: 600px) {
          .wall {
            width: 8px;
            height: 8px;
          }
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
      `}</style>
    </table>
  );
}

export default Maze;
