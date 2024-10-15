
# Mars Robot test task

## Running
This test test's solution is verified by the unit tests at `index.test.ts`, with `vitest` as the chosen test runner. `pnpm` is used for package management, but you should
be able to use `npm` instead for the sake of getting it running

To get up and running
```
pnpm install
pnpm test
```

## Reviewer notes

- I've left many comments beginning with `@NOTE:`, all of these are notes to you, the reviewer
rather than comments I'd leave in the code. I've tried to keep commenting at a level that I feel is
sufficient if all of the additional notes were removed.  
I chose to add these as:
    - this task is time constrained and outside of an existing repo and it's conventions  
    - I might usually discuss some of these decisions either with colleagues beforehand, or over a code review after.

- I personally prefer a light functional style, so the code mostly operates on simple data structures rather than
anything remotely OOP. And at the cost of verbosity/LoC I've liberally added helper functions to try and aid readability



p.s. This puzzle felt quite reminiscent of Advent of Code - if it's of any interest I have my submissions for 2021/2022's
AoC written in Elixir in [mcky/advent-of-code](https://github.com/mcky/advent-of-code/tree/master/2021-2022-elixir/lib/puzzles/2022).
It follows a similar pattern of `parse puzzle input -> reduce over results -> output`, albeit the only UI there is to help me debug personally
