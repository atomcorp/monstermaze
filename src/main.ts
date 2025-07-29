const canvas = document.getElementById("app") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

const multiplier = 50;
const mapSize = 10; // 10x10, this allows us to work with flat array

const map = [
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 1,
  1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0,
  0, 0, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1,
  0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
] as const;

const mapPositions = map.map((cell, i) => {
  const y = Math.floor(i / mapSize) * mapSize;
  const x = (i % mapSize) * mapSize;
  let isWall = false;
  if (cell === 1) {
    isWall = true;
  }
  return { x, y, isWall };
});

type Position = {
  x: number;
  y: number;
};

const drawWalls = () => {
  ctx.fillStyle = "black";
  map.forEach((cell, i) => {
    if (cell === 1) {
      const y = Math.floor(i / mapSize);
      const x = i % mapSize;
      ctx.fillRect(x * multiplier, y * multiplier, multiplier, multiplier);
    }
  });
};

const preDraw = () => {
  drawWalls();
};

const getCell = (pos: Position) => {
  return map[pos.y + pos.x / mapSize];
};

const getIsSamePosition = (posA: Position, posB: Position) => {
  return posA.x === posB.x && posA.y === posB.y;
};

const getNeighbours = (pos: Position) => {
  const neighbours: Array<Position> = [];
  const up = { x: pos.x, y: pos.y - mapSize };
  const down = { x: pos.x, y: pos.y + mapSize };
  const left = { x: pos.x - mapSize, y: pos.y };
  const right = { x: pos.x + mapSize, y: pos.y };

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

const getIsValidStep = (pos: Position, direction: Direction) => {
  const up = { x: pos.x, y: pos.y - mapSize };
  const down = { x: pos.x, y: pos.y + mapSize };
  const left = { x: pos.x - mapSize, y: pos.y };
  const right = { x: pos.x + mapSize, y: pos.y };

  if (direction === "up" && getCell(up) === 0) {
    return up;
  }
  if (direction === "down" && getCell(down) === 0) {
    return down;
  }
  if (direction === "left" && getCell(left) === 0) {
    return left;
  }
  if (direction === "right" && getCell(right) === 0) {
    return right;
  }

  return;
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
  return path;
};

const playerControls = (movePlayerPos: (direction: Direction) => void) => {
  document.addEventListener("keydown", (e) => {
    const key = e.key;
    if (key === "ArrowUp") {
      movePlayerPos("up");
    }
    if (key === "ArrowDown") {
      movePlayerPos("down");
    }
    if (key === "ArrowLeft") {
      movePlayerPos("left");
    }
    if (key === "ArrowRight") {
      movePlayerPos("right");
    }
  });
};

type Direction = "up" | "down" | "left" | "right";

const player = () => {
  const playerPos = { x: 10, y: 10 };

  const movePlayerPos = (direction: Direction) => {
    const nextPosition = getIsValidStep(playerPos, direction);
    if (!nextPosition) {
      return;
    }
    playerPos.x = nextPosition.x;
    playerPos.y = nextPosition.y;
  };

  const getPlayerPos = () => {
    return {
      x: playerPos.x,
      y: playerPos.y,
    };
  };

  return { movePlayerPos, getPlayerPos };
};

const generateRandomTarget = () => {
  const validMapPositions = mapPositions.filter((pos) => !pos.isWall);
  return validMapPositions[
    Math.floor(Math.random() * (validMapPositions.length - 1))
  ];
};

const enemy = () => {
  const enemyPos: Position = { x: 80, y: 80 };
  const targetPos: Position = { x: 80, y: 10 };
  const moveEnemyPos = (position: Position) => {
    enemyPos.x = position.x;
    enemyPos.y = position.y;
  };

  const setEnemyTargetPos = (position: Position) => {
    targetPos.x = position.x;
    targetPos.y = position.y;
  };

  const getEnemyPos = () => {
    return {
      x: enemyPos.x,
      y: enemyPos.y,
    };
  };

  const getEnemyTargetPos = () => {
    return {
      x: targetPos.x,
      y: targetPos.y,
    };
  };

  return { moveEnemyPos, setEnemyTargetPos, getEnemyPos, getEnemyTargetPos };
};

// const enemyBehaviour = (enemyPos: Position, targetPos: Position) => {
//   // searching = doesn't know exact position, pick random(ish?) cell, once reached, pick another
//   // hunting - has last position

//   let currentMode: "searching" | "hunting" = "searching";

//   // if (currentMode === "searching") {
//   // }
// };

const isPlayerInSight = (playerPos: Position, path: Array<Position>) => {
  return (
    path.every((pathPos) => pathPos.x === playerPos.x) ||
    path.every((pathPos) => pathPos.y === playerPos.y)
  );
};

function run() {
  const { movePlayerPos, getPlayerPos } = player();
  const { moveEnemyPos, getEnemyPos, getEnemyTargetPos, setEnemyTargetPos } =
    enemy();
  playerControls(movePlayerPos);

  // to move pos, get ta
  setInterval(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    preDraw();
    const enemyPos = getEnemyPos();
    const enemyTargetPos = getEnemyTargetPos();
    const playerPos = getPlayerPos();
    const spots = breadthFirstSearch(enemyPos); // name: possible positions?
    const path = getRoute(enemyPos, enemyTargetPos, spots).reverse();
    const nextStep = path[0];

    if (nextStep && !getIsSamePosition(playerPos, enemyPos)) {
      moveEnemyPos({ x: nextStep.x, y: nextStep.y });
      // follow the arrows backwards from the goal to the start
    }
    if (isPlayerInSight(playerPos, getRoute(enemyPos, playerPos, spots))) {
      setEnemyTargetPos(playerPos);
    }
    if (getIsSamePosition(enemyPos, enemyTargetPos)) {
      setEnemyTargetPos(generateRandomTarget());
    }

    // draw enemy
    ctx.fillStyle = "red";
    ctx.fillRect(enemyPos.x * 5, enemyPos.y * 5, multiplier, multiplier);
    // draw player
    ctx.fillStyle = "blue";
    ctx.fillRect(playerPos.x * 5, playerPos.y * 5, multiplier, multiplier);
  }, 500);
}

// next, move the target
// set the target to random
// look for target - ie needs line of sight
// https://www.redblobgames.com/pathfinding/a-star/introduction.html
run();
