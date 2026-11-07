# Matching

How a set of drawn strokes is compared with sign skeletons to produce a ranked list of candidate signs. The input is the strokes produced by [stroke recognition](stroke-recognition.md); skeletons come from `data/skeletons/` (see [skeleton-format.md](skeleton-format.md)). The implementation is in [`src/core/matcher/`](../src/core/matcher/).

| File           | What it does                                                                   |
| -------------- | ------------------------------------------------------------------------------ |
| `normalize.ts` | puts strokes into a standard frame                                             |
| `features.ts`  | reduces each stroke to a few numbers                                           |
| `pairCost.ts`  | the cost of pairing one drawn stroke with one skeleton stroke, and the weights |
| `match.ts`     | scores a drawing against one sample                                            |
| `rank.ts`      | ranks signs, skipping those that can't reach the top results                   |

## Goals

- **Stroke order must not matter.** People draw the wedges of a sign in different orders, and the order says nothing about which sign it is.
- **Extra and missing strokes cost something but don't rule a sign out.** Users skip wedges, add stray ones, or merge two into one.
- **Position, direction and size all count,** so that signs with the same wedge counts but different layouts can be told apart. Counting wedge types alone, as CuneiPainter does (see [prior-art.md](prior-art.md)), produces too many ties.
- **Fast enough to rank about 1,200 signs after every stroke on a phone.**

## Pipeline

1. Normalise the drawing and each skeleton into the same frame.
2. Describe each stroke by a few features.
3. For each skeleton, find the cheapest one-to-one pairing between drawn and skeleton strokes, where unpaired strokes pay a fixed penalty.
4. Score = total cost ÷ the larger stroke count. Lower is better.
5. Rank signs by their best score over all their samples, skipping signs that can't make the top results.

## 1. Normalisation

Collect the key points of every stroke: both ends of each wedge; the vertex and both leg ends of each Winkelhaken. Take their bounding box, move its centre to the origin, and divide by the longer side. A sign then fits in a box whose longer side is 1, keeping its proportions.

This removes position and scale on the canvas, so a sign can be drawn anywhere and at any size. It keeps the aspect ratio, so a tall sign stays tall. The drawing and the skeletons go through the same function, `normalize()`, so they're directly comparable. Skeletons are normalised once, by `prepareSample()`, when the sign database is built.

**Weakness:** one stray stroke far from the rest shrinks and shifts everything else. Proportions also vary between users; someone who draws a sign squashed sideways will have every position slightly off.

## 2. Features

| Stroke      | Features                                                                                                           |
| ----------- | ------------------------------------------------------------------------------------------------------------------ |
| Wedge       | `position` = midpoint; `angle` = direction from head to tail (−π…π, y pointing down); `logLength` = ln(length)     |
| Winkelhaken | `position` = vertex; `logSize` = ln(mean leg length); `opening` = direction of the sum of the two unit leg vectors |

Lengths are kept as logarithms because they are only ever compared as ratios.

## 3. Cost of pairing two strokes

`pairCost(f, g)` for a drawn stroke f and a skeleton stroke g, with the weights in `defaultWeights`:

| Weight               | Default | Applies to                                                                                 |
| -------------------- | ------- | ------------------------------------------------------------------------------------------ |
| `angle`              | 1.0     | per 45° of direction error                                                                 |
| `reversed`           | 0.8     | added when a wedge seems to be drawn tail-first                                            |
| `position`           | 2.0     | per unit of distance between positions, in the normalised frame where the sign is 1 across |
| `length`             | 0.4     | per unit of \|ln(length ratio)\|                                                           |
| `winkelhakenSize`    | 0.3     | per unit of \|ln(size ratio)\|                                                             |
| `winkelhakenOpening` | 0.4     | per 90° of opening-direction error                                                         |
| `kindMismatch`       | 3.0     | wedge paired with a Winkelhaken                                                            |
| `unmatched`          | 1.6     | each extra or missing stroke                                                               |

With `d` the angle between the two wedge directions, in `[0, π]`, and `dpos` the distance between positions:

```
wedge–wedge:              angle · min(d/45°, (180° − d)/45° + reversed)  +  position · dpos  +  length · |ln(lenf / leng)|
Winkelhaken–Winkelhaken:  position · dpos  +  winkelhakenSize · |ln(sizef / sizeg)|  +  winkelhakenOpening · (opening difference)/90°
mixed:                    kindMismatch + position · dpos
```

The `min(…)` in the wedge term makes a wedge drawn from the wrong end cheaper than a wedge pointing a different way: drawing a horizontal right-to-left costs 0.8, not the 4.0 that 180° of error would give. Lengths are compared as ratios on a log scale, so that half-length and double-length cost the same.

## 4. Pairing strokes: the assignment problem

Given n drawn strokes and m skeleton strokes, we want the one-to-one pairing with the lowest total cost. This is the classic assignment problem.

### Allowing unpaired strokes

`match()` builds an n × m matrix of pair costs, each capped at 2 × `unmatched`, and asks the solver for the cheapest one-to-one pairing of min(n, m) strokes:

- The |n − m| strokes left over on the larger side are extra or missing strokes, and cost `unmatched` each.
- A pair at the cap stands for leaving both strokes unpaired, which is what they would cost apart.

Any pattern of pairings and omissions is possible. In particular the result is the same as leaving two strokes unpaired, at 2 × 1.6 = 3.2, rather than pairing them badly, for example a wedge with a Winkelhaken at 3.0 or more.

The textbook construction is an (n + m)-wide square matrix, with an `unmatched` slot for every stroke on both sides and zero-cost slots where two empty slots meet. It gives the same optimum, but the solver is cubic in the matrix size, so it is up to 8 times more work.

### The Hungarian algorithm

Trying every pairing takes N! steps, impractical beyond about 10 strokes. The Hungarian algorithm (Kuhn 1955, Munkres 1957) finds the exact optimum in O(N³). Wedges uses the [munkres](https://github.com/havelessbemore/munkres) package (MIT, no dependencies), which accepts rectangular matrices. `match()` passes it plain arrays: it solves typed-array rows several times slower. It keeps a number for each row and column such that every cost minus its row's and column's numbers is never negative, and grows a matching using only cells where that difference is 0: once every row is matched that way, nothing can be cheaper.

It replaced a hand-written solver in November 2026 with identical rankings. Solving alone, it was about 3 times slower on 3 × 3 matrices and about twice as fast on 30 × 30, which is where ranking is slowest.

**Example:** you draw TAB's two horizontals, bottom first. Pairing each drawn wedge with the skeleton wedge at the same height costs about 0; the crossed pairing costs about 2 × the position error. The algorithm picks the first, so the order you drew in makes no difference.

### Score

```
score = (total cost of the optimal assignment) / max(n, m)
```

Dividing by the larger stroke count keeps big signs comparable with small ones: a 20-stroke sign with a few small errors shouldn't lose to a 3-stroke sign that matches badly. `match()` also returns the pairs, which could be used to highlight which drawn stroke matched which skeleton stroke.

## 5. Ranking

A sign can have several samples. Its score is the best score over all of them, so each sample effectively votes for the sign. This lets variant forms, such as different script styles, sit side by side without averaging. `rank()` takes any list of objects with `samples`, and an optional `filter` to leave some signs out, for example numerals.

### Skipping signs that can't reach the top results

`rank(drawing, signs, { limit })` keeps a running list of the best `limit` scores, and skips any sign that can't beat the worst of them. Two lower bounds make that cheap:

1. **From stroke counts,** before any costs are worked out (`scoreLowerBound()`). At least |n − m| strokes must go unpaired. And after pairing wedges with wedges and Winkelhaken with Winkelhaken, any strokes left over of one kind must be paired with the other kind, or left unpaired: each such pair costs at least min(`kindMismatch`, 2 × `unmatched`). Signs are visited in order of this bound, so once it exceeds the cutoff, the search stops.
2. **From the cost matrix,** before solving it (in `match()`). Every stroke on the smaller side pays at least its cheapest pair, plus `unmatched` for each stroke left over; every stroke on the larger side pays at least its cheapest pair or `unmatched`, whichever is less. The larger of the two sums is a lower bound on the total. If it is above the cutoff, the solver doesn't run.

Neither bound changes the results: the top `limit` are exactly those of a full ranking, as a unit test checks. The candidate list uses `limit = 3`.

## Performance

Cost per comparison is O(min(n, m)² · max(n, m)). A ranking does at most one comparison per sample: linear in database size, cubic in stroke counts.

`npm run bench:performance` times a ranking of the 832 skeletons, with `limit = 3`, in headless Chromium with the CPU throttled 4×, to stand in for a mid-range phone. Median of 10 synthetic drawings each, November 2026:

| Strokes drawn | Time  |
| ------------- | ----- |
| 1             | 1 ms  |
| 5             | 5 ms  |
| 10            | 20 ms |
| 20            | 37 ms |
| 30            | 53 ms |

The budget is 50 ms, so ranking runs on the main thread after each stroke, with no Web Worker; see [decision 0006](decisions/0006-ranking-on-main-thread.md). Large signs gain least from skipping, because many skeletons have similar stroke counts.

> [!IMPORTANT]
> **Ranking is a hot path.** Changes to `src/core/matcher` can cost speed, so run `npm run bench:performance` before and after. munkres needs plain arrays: it is several times slower on typed-array rows.

## Accuracy

`npm run bench:accuracy` draws every skeleton 40 times with noise: endpoints jittered by 0.6 grid units (6% of the sign's size), stroke order shuffled, and flicks on 30% of wedges. It reports how often the right sign comes first and in the top three, and fails below 95% and 98%. The Accuracy Benchmark workflow runs it, before and after, on each pull request that touches `src/core`, `data/` or the benchmark itself, and it takes a few minutes on a desktop.

| Skeletons | Right sign first | In top 3 |
| --------- | ---------------- | -------- |
| 832       | 96.2%            | 98.9%    |

The commonest confusions are signs that look identical: DIŠ, ONE GEŠ₂ and OLD ASSYRIAN WORD DIVIDER are all a single vertical wedge, and numerals such as SIX DIŠ and SIX GEŠ₂ share a shape across counting systems. No drawing can separate those; the candidate list shows them side by side. Apart from those, most are within the DAG KISIM₅× family: 25 signs with the same large outer frame, differing only in the small sign written inside. That inner sign is a few strokes out of 20–30, all close together, so a wrong inner sign costs little against the whole. These can be built from their parts instead of drawn whole, by combining signs.

These figures only show that the skeletons are distinct from each other. Real freehand drawings will score worse.

## Design decisions

- **The approach has precedents.** Optimal pairing of parts is a standard way to compare shapes; Belongie et al. (2002), for example, match sample points on handwritten digits this way. For cuneiform, Bogacz et al. (2015) match characters taken from tablet scans by pairing their wedges. The matcher here was developed independently, but follows the same idea, applied to drawn strokes.
- **Optimal pairing rather than a sequence method.** Methods that compare strokes in order (dynamic time warping, edit distance) need a consistent stroke order. Cuneiform has no standard drawing order for a touchscreen, so the assignment model is the right one.
- **Nearest sample rather than learned classes.** Each sign is matched against its stored samples directly. Adding a sample needs no retraining. A learned model might do better with enough data, but would hide why a sign matched.
- **Hand-set weights.** The defaults were chosen by eye and checked with the synthetic benchmark. Labelled real drawings would be needed to fit them properly.

## Tests

- Unit tests beside each file: pair costs, normalisation, hand-written pairings in `match()` (stroke order, reversed wedges, extra and missing strokes, a wedge against a Winkelhaken, the cutoff), and ranking with and without a limit.
- `test/ranking.test.ts`: every skeleton, drawn cleanly in a random stroke order, must be among the three candidates shown. A failure names the sign.

## Known weaknesses and ideas

- **Script styles:** the skeletons follow the Noto font's older style. Signs that a user learned in another style (for example Neo-Assyrian) need extra samples in that style. No weight change will fix that.
- **Close neighbours:** signs that differ by one wedge or a small shift can only be separated by careful drawing. Showing three candidates is the main defence.
- **Normalisation:** a bounding box is sensitive to outlying strokes. A centroid with spread-based scaling, or a search over small scale and offset adjustments, would be more robust.
- **Frequency weighting:** using how common each sign is (from Oracc or CDLI counts) to break near-ties would help common-sign lookup. We decided against it for now; see [prior-art.md](prior-art.md) for data sources.
- **Wedge-type counts:** counting strokes by type, in the spirit of Gottstein's codes (H horizontal, V vertical, D diagonal, W Winkelhaken; AN is H1 V1 D2), could serve as a cheap pre-filter or a check on new skeletons.
- **Feedback during drawing:** ranking runs after every stroke. The app might also accept automatically when one candidate is far ahead.

## References

- H. W. Kuhn, "The Hungarian method for the assignment problem", _Naval Research Logistics Quarterly_ 2 (1955), 83–97.
- J. Munkres, "Algorithms for the assignment and transportation problems", _Journal of the Society for Industrial and Applied Mathematics_ 5 (1957), 32–38.
- S. Belongie, J. Malik and J. Puzicha, "Shape matching and object recognition using shape contexts", _IEEE Transactions on Pattern Analysis and Machine Intelligence_ 24 (2002), 509–522.
- B. Bogacz et al., "Character retrieval of vectorized cuneiform script", _ICDAR 2015_, [doi:10.1109/ICDAR.2015.7333777](https://doi.org/10.1109/ICDAR.2015.7333777).
