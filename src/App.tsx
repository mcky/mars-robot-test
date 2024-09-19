import { useMemo } from "react";
import "./App.css";
import {
  Coordinate,
  parseInputs,
  Position,
  processRobot,
  RobotInstructions,
} from "./robots";

/**
 * Draw an SVG grid and plot the paths of each of our robots
 * on it
 */
function App({ input }: { input: string }) {
  const { grid, robots } = useMemo(() => parseInputs(input), [input]);
  const [[xMin, yMin], [xMax, yMax]] = grid;

  const width = 500;
  const aspectRatio = (xMax - xMin) / (yMax - yMin);

  const height = width / aspectRatio;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`${xMin} ${yMin} ${xMax} ${yMax}`}
      preserveAspectRatio="xMidYMid meet"
    >
      <GridLines xMin={xMin} yMin={yMin} xMax={xMax} yMax={yMax} />

      <AllRobots robots={robots} grid={grid} />
    </svg>
  );
}

type RobotsProps = {
  robots: RobotInstructions[];
  grid: [Coordinate, Coordinate];
};

// function AllRobots({ robots, grid }: RobotsProps) {
//   let lostRobotMarkers: Coordinate[] = [];

//   let allVisitedPositions: Position[][] = [];

//   for (const robot of robots) {
//     const [finalPosition, wasLost, visitedPositions] = processRobot(
//       robot,
//       lostRobotMarkers,
//       grid
//     );

//     if (wasLost) {
//       const [finalCoords] = finalPosition;
//       lostRobotMarkers.push(finalCoords);
//     }

//     allVisitedPositions.push(visitedPositions);
//   }

//   const [[_xMin, _yMin], [_xMax, yMax]] = grid;

//   return (
//     <>
//       {allVisitedPositions.map((robotPositions) => {
//         return <Robot positions={robotPositions} yMax={yMax} />;
//       })}
//     </>
//   );
// }

/**
 *
 * @NOTE: This is basically a re-implementation of the main function
 * in robots.ts
 * It would need a rethink and probably a refactor if we wanted a richer
 * animated experience (e.g. emitting the moves one by one), but for
 * the sake of simplicity I've simply plotted them all at once
 */
function AllRobots({ robots, grid }: RobotsProps) {
  let lostRobotMarkers: Coordinate[] = [];

  let finalState: Array<{
    visitedPositions: Position[];
    wasLost: boolean;
  }> = [];

  for (const robot of robots) {
    const [finalPosition, wasLost, visitedPositions] = processRobot(
      robot,
      lostRobotMarkers,
      grid
    );

    if (wasLost) {
      const [finalCoords] = finalPosition;
      lostRobotMarkers.push(finalCoords);
    }

    finalState.push({
      visitedPositions,
      wasLost,
    });
  }

  const [[_xMin, _yMin], [_xMax, yMax]] = grid;

  return (
    <>
      {finalState.map((robotState) => {
        return (
          <Robot
            positions={robotState.visitedPositions}
            wasLost={robotState.wasLost}
            yMax={yMax}
          />
        );
      })}
    </>
  );
}

type RobotProps = {
  positions: Position[];
  wasLost: boolean;
  yMax: number;
};

function Robot({ positions, wasLost, yMax }: RobotProps) {
  const coordinates = positions.map(([coordinate, _orientation]) => coordinate);
  const [[finalX, finalY], finalOrientation] = positions[positions.length - 1];

  /**
   * Since our SVG grid has the top left as 0,0, but our martian grid
   * has 0,0 as the bottom left, we do a quick flip of the Y coordinate
   * for the sake of plotting
   */
  const inverseCoordinates = coordinates.map(([x, y]) => [x, yMax - y]);
  const inverseFinalCoordinate: Coordinate = [finalX, yMax - finalY];

  const pathD = inverseCoordinates.reduce((acc, [x, y], index) => {
    if (index === 0) {
      return `M${x},${y}`;
    }
    return `${acc} L${x},${y}`;
  }, "");

  return (
    <>
      <path d={pathD} fill="none" stroke="blue" strokeWidth="0.05" />
      {wasLost && <LostIndicator coordinates={inverseFinalCoordinate} />}

      {!wasLost && (
        <DirectionIndicator
          coordinates={inverseFinalCoordinate}
          rotation={finalOrientation}
        />
      )}
    </>
  );
}

/**
 * Draws a directional arrow-head, pointing in the direction of `rotation`
 *
 * @NOTE: I had AI write the calculations for this part, since it's
 * just for the sake of the demo
 */
function DirectionIndicator({
  coordinates,
  rotation,
}: {
  coordinates: Coordinate;
  rotation: number;
}) {
  const [x, y] = coordinates;

  const arrowWidth = 0.5;
  const height = (Math.sqrt(3) / 2) * arrowWidth;
  const points = [
    `${x} ${y - (2 / 3) * height}`, // Top vertex
    `${x - arrowWidth / 2} ${y + (1 / 3) * height}`, // Bottom left vertex
    `${x + arrowWidth / 2} ${y + (1 / 3) * height}`, // Bottom right vertex
  ].join(", ");

  const rotationTransform = `rotate(-${rotation} ${x} ${y})`;

  return <polygon points={points} fill="blue" transform={rotationTransform} />;
}

/**
 * Draws a circle at the given coordinates
 */
function LostIndicator({ coordinates }: { coordinates: Coordinate }) {
  const [x, y] = coordinates;

  // const arrowWidth = 0.5;
  // const height = (Math.sqrt(3) / 2) * arrowWidth;
  // const points = [
  //   `${x} ${y - (2 / 3) * height}`, // Top vertex
  //   `${x - arrowWidth / 2} ${y + (1 / 3) * height}`, // Bottom left vertex
  //   `${x + arrowWidth / 2} ${y + (1 / 3) * height}`, // Bottom right vertex
  // ].join(", ");

  // const rotationTransform = `rotate(-${rotation} ${x} ${y})`;

  return <circle cx={x} cy={y} r={0.2} fill="red" />;
}

type GridLinesProps = {
  xMin: number;
  yMin: number;
  xMax: number;
  yMax: number;
};

const GridLines = ({ xMin, yMin, xMax, yMax }: GridLinesProps) => {
  return (
    <>
      {Array.from({ length: xMax - xMin + 1 }, (_, index) => {
        const x = xMin + index;
        return (
          <line
            key={`grid-x-${x}`}
            x1={x}
            y1={yMin}
            x2={x}
            y2={yMax}
            stroke="gray"
            strokeWidth="0.01"
          />
        );
      })}

      {Array.from({ length: yMax - yMin + 1 }, (_, index) => {
        const y = yMin + index;
        return (
          <line
            key={`grid-y-${y}`}
            x1={xMin}
            y1={y}
            x2={xMax}
            y2={y}
            stroke="gray"
            strokeWidth="0.01"
          />
        );
      })}
    </>
  );
};

export default App;
