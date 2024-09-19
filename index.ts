/**
 * Given the input as a string, parse it and execute
 * the instructions for each robot, returning
 * the final robot positions
 */
export function main(input: string): string[] {
  const { grid, robots } = parseInputs(input);

  let lostRobotMarkers: Coordinate[] = [];
  let robotOutputs: string[] = [];

  for (const robot of robots) {
    const [finalPosition, wasLost] = processRobot(
      robot,
      lostRobotMarkers,
      grid
    );

    let formattedOutput = formatRobotOutput(finalPosition, wasLost);

    if (wasLost) {
      const [finalCoords] = finalPosition;
      lostRobotMarkers.push(finalCoords);
    }
    robotOutputs.push(formattedOutput);
  }

  return robotOutputs;
}

// @NOTE: For the sake of simplicity in the test, let's imagine we've got a
// logging library like `debug`, rather than using console.log
const debug = console.log.bind(console);

/*
 * --------------------------------------------------------------
 * MARK: Typedefs
 * --------------------------------------------------------------
 */

/**
 * A coordinate represented as [x, y]
 */
type Coordinate = [number, number];

// To keep things simple / aid debugging instead of parsing the orientations
// into degrees they're kept as strings. In future we could parse them to 90deg
// increments, but that would require also re-serializing them for the end result
type Orientation = "N" | "S" | "E" | "W";

export enum Instruction {
  Left = "L",
  Right = "R",
  Forward = "F",
}

export type Position = [Coordinate, Orientation];

type RobotInstructions = {
  startPosition: Position;
  instructions: Instruction[];
};

/*
 * --------------------------------------------------------------
 * MARK: Instruction execution
 * --------------------------------------------------------------
 */

/**
 * Execute all instructions for a given robot.
 *
 * Returns the robots final position and a flag
 * indicating if it fell off the map.
 */
function processRobot(
  robot: RobotInstructions,
  lostMarkerPositions: Coordinate[],
  grid: [Coordinate, Coordinate]
): [Position, boolean] {
  let currentPosition = robot.startPosition;
  let robotIsOutOfBounds = false;

  debug(`processing robot at ${robot.startPosition}`);

  for (const instruction of robot.instructions) {
    const [[currX, currY]] = currentPosition;

    let robotLeftMarkerHere = lostMarkerPositions.some(
      ([lostX, lostY]) => lostX === currX && lostY === currY
    );

    debug(`applying ${instruction} to robot at ${currentPosition}`);
    const nextPosition = applyInstruction(currentPosition, instruction);
    debug(`resulting in ${nextPosition}`);

    const robotWillBeOutOfBounds = isOutOfBounds(nextPosition, grid);

    if (robotWillBeOutOfBounds && robotLeftMarkerHere) {
      debug(
        `moving to ${nextPosition} would take us out of bounds, stay at ${currentPosition}`
      );
      continue;
    }

    robotIsOutOfBounds = robotWillBeOutOfBounds;

    // If the robot drops off the edge, stop all processing
    // and don't update it's position, so we can keep track
    // of it's final position for the "scent marker"
    if (robotIsOutOfBounds) {
      break;
    } else {
      currentPosition = nextPosition;
    }
  }

  return [currentPosition, robotIsOutOfBounds];
}

/**
 * Apply a singular instruction to the robots current position
 */
export function applyInstruction(
  position: Position,
  instruction: Instruction
): Position {
  switch (instruction) {
    case Instruction.Forward:
      // Forward: the robot moves forward one grid point in the direction of the current
      //  orientation and maintains the same orientation.
      return moveForward(position);
    case Instruction.Left:
      // Left: the robot turns left 90 degrees and remains on the current grid point.
      return rotate(position, Instruction.Left);
    case Instruction.Right:
      //   Right: the robot turns right 90 degrees and remains on the current grid point.
      return rotate(position, Instruction.Right);
    default:
      // @ts-expect-error
      assertUnreachable();
  }
}

/*
 * --------------------------------------------------------------
 * MARK: Helpers
 * --------------------------------------------------------------
 */

function moveForward([[x, y], orientation]: Position): Position {
  switch (orientation) {
    case "N":
      return [[x, y + 1], orientation];
    case "S":
      return [[x, y - 1], orientation];
    case "E":
      return [[x + 1, y], orientation];
    case "W":
      return [[x - 1, y], orientation];
    default:
      // @ts-expect-error
      assertUnreachable();
  }
}

type Direction = Extract<Instruction, Instruction.Left | Instruction.Right>;

function rotate(
  [coords, orientation]: Position,
  direction: Direction
): Position {
  const directions: Orientation[] = ["N", "E", "S", "W"];
  const currentIdx = directions.indexOf(orientation);

  // @NOTE: This could be using modulo to wrap the index in the array etc, but since we
  // only have 4 cardinal directions and there can only be one rotation per instruction
  // this seems sufficient
  let nextIdx =
    direction === Instruction.Left ? currentIdx - 1 : currentIdx + 1;

  if (nextIdx >= directions.length) {
    // W->N
    nextIdx = 0;
  } else if (nextIdx === -1) {
    // N->W
    nextIdx = directions.length - 1;
  }

  const nextOrientation = directions[nextIdx];
  return [coords, nextOrientation];
}

function isOutOfBounds(
  [[x, y]]: Position,
  [[xMin, yMin], [xMax, yMax]]: [Coordinate, Coordinate]
): boolean {
  return x > xMax || y > yMax || x < xMin || y < yMin;
}

function formatRobotOutput(position: Position, wasLost: boolean): string {
  const [[x, y], orientation] = position;
  let formattedOutput = `${x} ${y} ${orientation}`;

  if (wasLost) {
    formattedOutput += ` LOST`;
  }

  return formattedOutput;
}

/*
 * --------------------------------------------------------------
 * MARK: Parsing
 * --------------------------------------------------------------
 */

type Inputs = {
  grid: [Coordinate, Coordinate];
  robots: RobotInstructions[];
};

/**
 * Transform the input string into a structured representation of our
 * initial state
 *
 * @NOTE: This implementation doesn't do much in the way of validating the inputs
 * (either to ensure we only parse valid inputs and don't have odd bugs, or to give
 * clearer error messages). In a real project I'd likely either use something like Zod,
 * or write some assertions and type predicates. For now I've kept it simpler.
 *
 * I'm a big believer in strict parsing at the edge (I/O boundary, network, or in
 * this case the input string) and then trusting types internally
 */
export function parseInputs(input: string): Inputs {
  const lines = input.trim().split("\n");
  const initialLine = lines[0];
  const instructionLines = lines.slice(1).join("\n");

  const [xMin, yMin] = [0, 0];
  const [xMax, yMax] = initialLine.split(" ").map((n) => parseInt(n, 10));

  const robots = instructionLines
    .split("\n\n")
    .map((line): RobotInstructions => {
      const [startingPosition, instructions] = line.split("\n");
      const [xStr, yStr, orientationStr] = startingPosition.split(" ");
      const startCoords: Coordinate = [parseInt(xStr, 10), parseInt(yStr, 10)];

      return {
        startPosition: [startCoords, orientationStr as Orientation],
        instructions: instructions.split("").map(parseInstruction),
      };
    });

  return {
    grid: [
      [xMin, yMin],
      [xMax, yMax],
    ],
    robots,
  };
}

function parseInstruction(char: string): Instruction {
  switch (char) {
    case "R":
      return Instruction.Right;
    case "L":
      return Instruction.Left;
    case "F":
      return Instruction.Forward;
    default:
      // @ts-expect-error
      assertUnreachable();
  }
}

/**
 * This function is to be used as the default case in a switch statement
 * which is expected to be exhaustive (e.g. ensuring all enum or union members are
 * matched).
 *
 * @example
 *     // If MyEnum.B is introduced this will cause a type-level
 *     // error
 *     switch (myEnum) {
 *       case MyEnum.A:
 *         doSomething()
 *       default:
 *        // \@ts-expect-error
 *        assertUnreachable();
 *    }
 */
function assertUnreachable(x: never): never {
  throw new Error("Didn't expect to get here");
}
