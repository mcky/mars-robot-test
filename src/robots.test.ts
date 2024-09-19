import {
  applyInstruction,
  Instruction,
  main,
  Orientation,
  parseInputs,
  Position,
} from "./robots";

/**
 * @NOTE: Most of the first-pass was written REPL style (using quokka.js) instead of TDD.
 *
 * Given more time I'd flesh out the test suite further, probably leaning more towards testing
 * processRobot and applyInstruction moreso than all the lower level helpers, as I see less
 * ROI from unit testing those (unless to document specific behavior or for regressions)
 */

test("handles the provided sample input", () => {
  const sampleInput = `
5 3
1 1 E
RFRFRFRF

3 2 N
FRRFLLFFRRFLL

0 3 W
LLFFFLFLFL
`;

  expect(main(sampleInput)).toEqual(["1 1 E", "3 3 N LOST", "2 3 S"]);
});

describe.todo("processRobot");

describe("applyInstruction", () => {
  // @NOTE: Given more time I'd either dupe these for each case, or
  // use it.each to cover all cases
  it("moves forward when facing north", () => {
    const startPosition: Position = [[0, 0], Orientation.North];
    const endPosition = [[0, 1], Orientation.North];

    expect(applyInstruction(startPosition, Instruction.Forward)).toEqual(
      endPosition
    );
  });

  it("rotates to the right", () => {
    const startPosition: Position = [[0, 0], Orientation.West];
    const endPosition = [[0, 0], Orientation.North];

    expect(applyInstruction(startPosition, Instruction.Right)).toEqual(
      endPosition
    );
  });

  it("rotates to the left", () => {
    const startPosition: Position = [[0, 0], Orientation.North];
    const endPosition = [[0, 0], Orientation.West];

    expect(applyInstruction(startPosition, Instruction.Left)).toEqual(
      endPosition
    );
  });
});

describe("parseInputs", () => {
  it("parses the starting coordinates", () => {
    const input = `1 1\n2 2 E\nRFL`;
    const parsed = parseInputs(input);

    expect(parsed.grid).toEqual([
      [0, 0],
      [1, 1],
    ]);
  });

  it("parses each robot", () => {
    const input = `1 1\n2 2 E\nRFL\n\n3 3 N\nRFL`;
    const parsed = parseInputs(input);

    expect(parsed.robots).toHaveLength(2);
  });

  it("parses a robots start position", () => {
    const input = `1 1\n2 2 E\nRFL`;
    const parsed = parseInputs(input);

    expect(parsed.robots[0].startPosition).toEqual([[2, 2], Orientation.East]);
  });

  it("parses a robots instructions", () => {
    const input = `1 1\n2 2 E\nRFL`;
    const parsed = parseInputs(input);

    expect(parsed.robots[0].instructions).toEqual([
      Instruction.Right,
      Instruction.Forward,
      Instruction.Left,
    ]);
  });

  // @NOTE: Personally I'm a fan of .todo tests for stubbing out expected behavior,
  // even if the behavior isn't yet implemented.
  it.todo("throws when passed malformed inputs");

  it.todo("throws when passed invalid instructions");
});
