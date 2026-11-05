# 0006: Rank on the main thread, without a Web Worker

- **Date:** 4 November 2026
- **Status:** accepted; timings corrected on 5 November 2026

## Context

Ranking runs after every stroke, against all 832 skeletons. On a desktop it took 12–77 ms before milestone 2, and it had never been measured on a phone. The budget is 50 ms on a CPU throttled 4×, which stands in for a mid-range phone. A Web Worker would keep the page responsive during a slow ranking, but adds messaging, a second bundle entry and asynchronous state to the drawing code.

## Decision

Rank on the main thread, when a stroke ends. Milestone 2 made ranking faster instead: an n × m cost matrix in place of a square n + m one, a lower bound from wedge and Winkelhaken counts, and a lower bound from each cost matrix before solving it. None of them changes the results.

Measured with `npm run bench` (headless Chromium, CPU throttled 4×, median of 10 drawings): 1 ms for 1 stroke, 20 ms for 10, 37 ms for 20 and 53 ms for 30. The figures first recorded here were taken with the hand-written solver that the munkres package replaced, and munkres was said to be no slower; it was, until 5 November 2026, because `match()` passed it typed-array rows and copied the cost matrix to find its lower bound, which put 10 strokes at 70–90 ms. Only the largest signs go over budget, and the pause comes between strokes, when the finger is lifted.

## Revisit when

Testing on real phones in milestone 7 shows a noticeable pause after a stroke, or the skeleton set grows a lot, for example with a second script style. Moving `rank()` into a Worker needs no change to `src/core`.
