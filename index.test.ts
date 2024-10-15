import {
  applyInstruction,
  Instruction,
  main,
  Orientation,
  parseInputs,
  Position,
} from "./";

/**
 * @NOTE: Most of the first-pass was written REPL style (using quokka.js) instead of TDD.
 *
 * Given more time I'd flesh out the test suite further, probably leaning more towards testing
 * processRobot and applyInstruction moreso than all the lower level helpers, as I see less
 * ROI from unit testing those (unless to document specific behavior or for regressions)
 */

test("handles the provided sample input", () => {
  const sampleInput = `
5 5

1 2 N

LMLMLMLMM

3 3 E

MMRMMRMRRM
`;

  expect(main(sampleInput)).toEqual(["1 3 N", "5 1 E"]);
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
    const input = `5 5\n\n1 2 N\n\nLMLMLMLMM`
    const parsed = parseInputs(input);

    expect(parsed.grid).toEqual([
      [0, 0],
      [5, 5],
    ]);
  });

  it("parses each robot", () => {
    const input = `5 5\n\n1 2 N\n\nLMLMLMLMM\n\n3 3 E\n\nMMRMMRMRRM`
    const parsed = parseInputs(input);

    expect(parsed.robots).toHaveLength(2);
  });

  it("parses a robots start position", () => {
    const input = `5 5\n\n1 2 N\n\nLMLMLMLMM`
    const parsed = parseInputs(input);

    expect(parsed.robots[0].startPosition).toEqual([[1, 2], Orientation.North]);
  });

  it("parses a robots instructions", () => {
    const input = `5 5\n\n1 2 N\n\nLMLMLMLMM`
    const parsed = parseInputs(input);

    expect(parsed.robots[0].instructions).toEqual([
      Instruction.Left,
      Instruction.Forward,
      Instruction.Left,
      Instruction.Forward,
      Instruction.Left,
      Instruction.Forward,
      Instruction.Left,
      Instruction.Forward,
      Instruction.Forward,
    ]);
  });

  // @NOTE: Personally I'm a fan of .todo tests for stubbing out expected behavior,
  // even if the behavior isn't yet implemented.
  it.todo("throws when passed malformed inputs");

  it.todo("throws when passed invalid instructions");
});
