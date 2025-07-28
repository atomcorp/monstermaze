const canvas = document.getElementById("app") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

const map = [
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 1,
  1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0,
  0, 0, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1,
  0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
] as const;

type Position = {
  x: number;
  y: number;
};

map.forEach((cell, i) => {
  if (cell === 1) {
    const y = Math.floor(i / 10);
    const x = i % 10;
    ctx.fillRect(x * 10, y * 10, 10, 10);
  }
});

const getCell = (pos: Position) => {
  return map[pos.y + pos.x / 10];
};

const getNeighbours = (pos: Position) => {
  const neighbours: Array<Position> = [];
  const up = { x: pos.x, y: pos.y - 10 };
  const down = { x: pos.x, y: pos.y + 10 };
  const left = { x: pos.x - 10, y: pos.y };
  const right = { x: pos.x + 10, y: pos.y };

  if (getCell(up) === 0) {
    neighbours.push(up);
  }
  if (getCell(down) === 0) {
    neighbours.push(down);
  }
  if (getCell(left) === 0) {
    neighbours.push(left);
  }
  if (getCell(right) === 0) {
    neighbours.push(right);
  }

  return neighbours;
};

type ReachedPosition = Position & {
  origin: Position;
  distance: number;
};

/**
 * At every step, take a single element out of frontier and call it current.
 * Then find current’s neighbors.
 * For each neighbor, if it hasn’t been reached yet, add it to both frontier and reached.
 */
const breadthFirstSearch = (origin: Position) => {
  const frontier: Array<Position & { distance: number }> = [
    { ...origin, distance: 0 },
  ];
  const reachedList: Array<ReachedPosition> = [];

  while (frontier.length > 0) {
    // shift not pop is important, gets the closest neighbours first
    const current = frontier.shift();
    if (!current) {
      break;
    }

    const neighbours = getNeighbours(current);
    neighbours.forEach((neighbour) => {
      const distance = current.distance + 1;
      if (
        !reachedList.find((reached: Position) => {
          return reached.x === neighbour.x && reached.y === neighbour.y;
        })
      ) {
        const newPosition = {
          ...neighbour,
          distance,
        };
        frontier.push(newPosition);
        reachedList.push({ ...newPosition, origin: current });
      }
    });
  }
  return reachedList;
};

const getRoute = (
  origin: Position,
  destination: Position,
  reachedPositions: Array<ReachedPosition>
) => {
  const path: Array<Position> = [];
  const currentPosition = { ...destination }; // work back from destination to origin

  while (!(currentPosition.x === origin.x && currentPosition.y === origin.y)) {
    // where did the current position come from?
    const position = reachedPositions.find(
      (reachedPosition) =>
        reachedPosition.x === currentPosition.x &&
        reachedPosition.y === currentPosition.y
    );
    if (!position) {
      break;
    }
    path.push(position);
    currentPosition.x = position.origin.x;
    currentPosition.y = position.origin.y;

    // const direction = getDirection(currentPosition.origin, {x: currentPosition.x, y: currentPosition.y});

    // const nextPosition = getNeighbour(currentPosition, direction);
    // if (!nextPosition) {
    //   break;
    // }
  }
  console.log(currentPosition.x, origin.x, currentPosition.y, origin.y);

  return path;
};

function run() {
  const goal = { x: 80, y: 80 };
  const start = { x: 10, y: 10 };

  const spots = breadthFirstSearch(start);

  spots.forEach((spot) => {
    ctx.fillStyle = "blue";
    ctx.fillRect(spot.x, spot.y, 10, 10);
    ctx.fillStyle = "red";
    // ctx.fillText(
    //   // getDirection(spot.origin, { x: spot.x, y: spot.y }),
    //   spot.distance,
    //   spot.x + 2,
    //   spot.y + 8
    // );
  });

  // const path = getRoute(start, goal, spots).reverse()

  // to move pos, get ta
  console.log(getRoute(start, goal, spots).reverse());
  setInterval(() => {
    const path = getRoute(start, goal, spots).reverse();
    const nextStep = path[0];
    // console.log(path)
    if (nextStep && !(start.x === goal.x && start.y === goal.y)) {
      start.x = nextStep.x;
      start.y = nextStep.y;

      // follow the arrows backwards from the goal to the start
    }

    ctx.fillStyle = "red";
    ctx.fillRect(start.x, start.y, 10, 10);
  }, 100);
}

// next, move the target
// set the target to random
// look for target - ie needs line of sight
// https://www.redblobgames.com/pathfinding/a-star/introduction.html
run();
