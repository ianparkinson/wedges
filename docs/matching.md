# Matching

> **Carried over from the prototype.** This document describes the algorithms in
> [cuneiforminputprototype](https://github.com/ianparkinson/cuneiforminputprototype),
> which Wedges ports to TypeScript in milestone 2. Until then, file names such as
> `matcher.js` refer to the prototype. Each port updates the names here to the new
> modules in `src/core/` (see [AGENTS.md](../AGENTS.md)).

How a set of drawn strokes is compared with sign templates to produce a ranked list of candidate signs. The input is the strokes produced by [stroke recognition](stroke-recognition.md); templates come from `signs.js` and the user's own samples (see [sample-format.md](sample-format.md)). The implementation is `Matcher` in `matcher.js`.

## Goals

- **Stroke order must not matter.** People draw the wedges of a sign in different orders, and the order says nothing about which sign it is.
- **Extra and missing strokes cost something but don't rule a sign out.** Users skip wedges, add stray ones, or merge two into one.
- **Position, direction and size all count,** so that signs with the same wedge counts but different layouts can be told apart. Counting wedge types alone, as CuneiPainter does (see [prior-art.md](prior-art.md)), produces too many ties.
- **Fast enough to rank about 1,200 signs after every stroke on a phone.**

## Pipeline

1. Normalise the drawing and each template into the same frame.
2. Describe each stroke by a few features.
3. For each template, find the cheapest one-to-one pairing between drawn and template strokes, where unpaired strokes pay a fixed penalty.
4. Score = total cost ÷ the larger stroke count. Lower is better.
5. Rank signs by their best score over all their samples, skipping signs that can't make the top results.

## 1. Normalisation

Collect the key points of every stroke: both ends of each wedge; the vertex and both leg ends of each Winkelhaken. Take their bounding box, move its centre to the origin, and divide by the longer side. A sign then fits in a box whose longer side is 1, keeping its proportions.

This removes position and scale on the canvas, so a sign can be drawn anywhere and at any size. It keeps the aspect ratio, so a tall sign stays tall. The drawing and the templates go through the same function (`Matcher.normalize`), so they're directly comparable. Templates are normalised once, when the database is built.

**Weakness:** one stray stroke far from the rest shrinks and shifts everything else. Proportions also vary between users; someone who draws a sign squashed sideways will have every position slightly off.

## 2. Features

| Stroke | Features |
|---|---|
| Wedge | midpoint `m`; direction `ang` = angle from head to tail (−π…π, y pointing down); length `len` |
| Winkelhaken | position `m` = vertex; size = mean leg length; opening direction `open` = direction of the sum of the two unit leg vectors |

## 3. Cost of pairing two strokes

`pairCost(f, g)` for a drawn stroke f and a template stroke g, with the weights in `Matcher.weights`:

| Weight | Default | Applies to |
|---|---|---|
| `ang` | 1.0 | per 45° of direction error |
| `reversed` | 0.8 | added when a wedge seems to be drawn tail-first |
| `pos` | 2.0 | per unit of distance between positions, in the normalised frame where the sign is 1 across |
| `len` | 0.4 | per unit of \|ln(length ratio)\| |
| `whSize` | 0.3 | per unit of \|ln(size ratio)\| |
| `whOpen` | 0.4 | per 90° of opening-direction error |
| `typeMismatch` | 3.0 | wedge paired with a Winkelhaken |
| `unmatched` | 1.6 | each extra or missing stroke |

With `d` the angle between the two wedge directions, in [0, π], and `dpos` the distance between positions:

```
wedge–wedge:  ang · min(d/45°, (180° − d)/45° + reversed)  +  pos · dpos  +  len · |ln(lenf / leng)|
wh–wh:        pos · dpos  +  whSize · |ln(sizef / sizeg)|  +  whOpen · (opening difference)/90°
mixed:        typeMismatch + pos · dpos
```

The `min(…)` in the wedge term makes a wedge drawn from the wrong end cheaper than a wedge pointing a different way: drawing a horizontal right-to-left costs 0.8, not the 4.0 that 180° of error would give. Lengths are compared as ratios on a log scale, so that half-length and double-length cost the same.

## 4. Pairing strokes: the assignment problem

Given n drawn strokes and m template strokes, we want the one-to-one pairing with the lowest total cost. This is the classic assignment problem.

### Allowing unpaired strokes

`match()` builds a square cost matrix of size **N = n + m**:

```
                  template t₁..tₘ        "missing" slots (n)
drawn d₁..dₙ    [ pairCost(dᵢ, tⱼ) ]    [ unmatched ]
"extra" slots   [ unmatched        ]    [ 0 ]
(m)
```

- A drawn stroke placed in a "missing" slot is an extra stroke the template doesn't have; it costs `unmatched`.
- A template stroke placed in an "extra" slot was left out by the user; it costs `unmatched` too.
- Leftover slots pair with each other for free.

Any pattern of pairings and omissions is possible. In particular the algorithm will leave two strokes unpaired, at 2 × 1.6 = 3.2, rather than pair them badly, for example a wedge with a Winkelhaken at 3.0 or more.

### The Hungarian algorithm

Trying every pairing takes N! steps, impractical beyond about 10 strokes. The Hungarian algorithm (Kuhn 1955, Munkres 1957) finds the exact optimum, in O(N³) with later refinements (Edmonds & Karp 1972, Tomizawa 1971). `hungarian()` is the standard compact implementation, which uses shortest paths and potentials.

It keeps a number uᵢ for each row and vⱼ for each column such that the **reduced cost** `c[i][j] − uᵢ − vⱼ` is never negative. A cell with reduced cost 0 is **tight**. If every row can be matched to a different column using only tight cells, that matching is optimal: every cell costs at least uᵢ + vⱼ, and a tight matching costs exactly Σu + Σv, so nothing can be cheaper.

Rows are added one at a time:

1. **Find a free column for the new row.** Getting there may mean moving already-matched rows to other columns, in a chain: an augmenting path.
2. **Search like Dijkstra,** using reduced costs as distances. `minv[j]` holds the cheapest known way to reach column j, and `way[j]` the step that got there.
3. **Adjust the potentials.** When no tight cell leads any further, take the smallest reduced cost `delta` to a column not yet reached, and shift the potentials of the reached rows and columns by `delta`. This makes at least one new cell tight, keeps every existing match tight, and keeps every reduced cost non-negative.
4. **Flip the path.** Once a free column is reached, follow `way[]` back and reassign each row along the chain.

Each row takes at most N rounds of O(N) work, so O(N²) per row and O(N³) overall. The result, `ans[row] = column`, is the optimal pairing.

**Example:** you draw TAB's two horizontals, bottom first. Pairing each drawn wedge with the template wedge at the same height costs about 0; the crossed pairing costs about 2 × the position error. The algorithm picks the first, so the order you drew in makes no difference.

### Score

```
score = (total cost of the optimal assignment) / max(n, m)
```

Dividing by the larger stroke count keeps big signs comparable with small ones: a 20-stroke sign with a few small errors shouldn't lose to a 3-stroke sign that matches badly. `match()` also returns the pairs, which could be used to highlight which drawn stroke matched which template stroke; nothing uses them yet.

## 5. Ranking

A sign can have several samples: its `signs.js` template plus any the user has traced. Its score is the best score over all of them, so each sample effectively votes for the sign. This lets variant forms, such as different script styles or personal habits, sit side by side without averaging.

### Skipping signs that can't reach the top N

At least |n − m| strokes must go unpaired, so a template's score can't be lower than

```
lower bound = unmatched · |n − m| / max(n, m)
```

`rank(drawn, db, limit)` sorts signs by this bound and keeps a running list of the best `limit` scores. As soon as a sign's bound exceeds the worst of those, no remaining sign can enter the top `limit`, and the search stops. The candidate list uses `limit = 12`. Over 200 random drawings, the top 12 were identical to a full ranking every time.

Test me scoring calls `rank` with no limit, because it needs the target sign's position even when that's low.

## Performance

Cost per comparison is O((n + m)³). A ranking does one comparison per sample, so it's roughly Σ over templates of (n + mₜ)³: linear in database size, cubic in stroke counts.

| Case | N = n + m | N³ |
|---|---|---|
| Drawing AN (4 strokes) against AN | 8 | ~500 |
| Typical: 8 drawn, 10 in template | 18 | ~6,000 |
| Largest template, AN PLUS NAGA SQUARED (76 strokes), against 10 drawn | 86 | ~640,000 |

Measured with a synthetic database of 1,234 signs, in Node on a desktop (October 2026):

| Strokes drawn | Without skipping | With `limit = 12` |
|---|---|---|
| 1 | 23 ms | 1.5 ms |
| 5 | 52 ms | 32 ms |
| 10 | 58 ms | 36 ms |
| 18 | 143 ms | 25 ms |

With the real database of 242 signs (October 2026), the candidate list (`limit = 12`) took 1 ms for a 1-stroke drawing, 12–25 ms for 4–12 strokes, 47 ms for 20 and 77 ms for 30. Large signs gain little from skipping, because many templates have similar stroke counts. Phones are typically several times slower; that hasn't been measured.

**Possible speed-up:** the matrix could be max(n, m) wide instead of n + m. Pad only the smaller side with unmatched slots, and cap each pair cost at 2 × `unmatched`. The cap keeps the "leave both unpaired" option, so results are identical, and N³ shrinks by up to 8× when n and m are similar.

## Accuracy

`test/synthetic.js` draws every template in `signs.js` with noise: endpoints jittered, stroke order shuffled, and flicks on 30% of wedges. It then checks the ranking. With noise of 0.6 grid units (6% of the sign's size):

| Signs in `signs.js` | Right sign first | In top 3 |
|---|---|---|
| 163 | 98.8% | 99.7% |
| 242 | 96.4% | 98.6% |
| 371 | 96.8% | 98.9% |
| 536 | 97.4% | 99.1% |
| 832 | 96.1% | 98.8% |

The commonest confusions are between close relatives: AN PLUS NAGA SQUARED vs AN PLUS NAGA OPPOSING AN PLUS NAGA, AB×IGI GUNU vs AB×GAL, ARAD×KUR vs ARAD, and IL vs AL×ŠE. With 832 signs, the top confusions are signs that look identical: DIŠ, ONE GEŠ₂ and OLD ASSYRIAN WORD DIVIDER are all a single vertical wedge, and numerals such as SIX DIŠ and SIX GEŠ₂ share a shape across counting systems. No drawing can separate those; the candidate list shows them side by side. Apart from those, most are within the DAG KISIM₅× family: 25 signs with the same large outer frame, differing only in the small sign written inside. That inner sign is a few strokes out of 20–30, all close together, so a wrong inner sign costs little against the whole. Compound signs like these may need the inner part weighted more heavily, or matched separately.

The test uses `rank(…, 3)` and takes about 4 minutes for 242 signs. Large templates make it slow, because comparisons grow with the cube of stroke counts.

These figures only show that the templates are distinct from each other. Real freehand drawings will score worse; the Test me mode in training measures that.

## Wedge-type counts

`Matcher.signature()` counts strokes by type, in the spirit of Gottstein's codes: H horizontal (within 22.5° of horizontal), V vertical, D diagonal, W Winkelhaken. For example, AN is `H1 V1 D2`. It's shown in the status line and on candidate cards, and isn't used for ranking. In production it could serve as a cheap pre-filter, or as a check on new templates.

## Design decisions

- **The approach has precedents.** Optimal pairing of parts is a standard way to compare shapes; Belongie et al. (2002), for example, match sample points on handwritten digits this way. For cuneiform, Bogacz et al. (2015) match characters taken from tablet scans by pairing their wedges. `matcher.js` was developed independently, but follows the same idea, applied to drawn strokes.
- **Optimal pairing rather than a sequence method.** Methods that compare strokes in order (dynamic time warping, edit distance) need a consistent stroke order. Cuneiform has no standard drawing order for a touchscreen, so the assignment model is the right one.
- **Nearest sample rather than learned classes.** Each sign is matched against its stored samples directly. Adding a sample needs no retraining, and the user's own samples take effect immediately. A learned model might do better with enough data, but would hide why a sign matched.
- **Hand-set weights.** The defaults were chosen by eye and checked with the synthetic test. Test me drawings are labelled real data, suitable for fitting them properly.

## Known weaknesses and ideas for production

- **Script styles:** the templates follow the Noto font's older style. Signs that a user learned in another style (for example Neo-Assyrian) need extra samples in that style. No weight change will fix that.
- **Close neighbours:** signs that differ by one wedge or a small shift can only be separated by careful drawing. The candidate list (12 shown) is the main defence.
- **Normalisation:** a bounding box is sensitive to outlying strokes. A centroid with spread-based scaling, or a search over small scale and offset adjustments, would be more robust.
- **Frequency weighting:** using how common each sign is (from ORACC or CDLI counts) to break near-ties would help common-sign lookup. We decided against it for now; see [prior-art.md](prior-art.md) for data sources.
- **Feedback during drawing:** ranking runs after every stroke. A production input method might also predict the remaining strokes of the leading candidate to guide the user, or accept automatically when one candidate is far ahead.

## References

- H. W. Kuhn, "The Hungarian method for the assignment problem", *Naval Research Logistics Quarterly* 2 (1955), 83–97.
- J. Munkres, "Algorithms for the assignment and transportation problems", *Journal of the Society for Industrial and Applied Mathematics* 5 (1957), 32–38.
- N. Tomizawa, "On some techniques useful for solution of transportation network problems", *Networks* 1 (1971), 173–194.
- J. Edmonds and R. M. Karp, "Theoretical improvements in algorithmic efficiency for network flow problems", *Journal of the ACM* 19 (1972), 248–264.
- S. Belongie, J. Malik and J. Puzicha, "Shape matching and object recognition using shape contexts", *IEEE Transactions on Pattern Analysis and Machine Intelligence* 24 (2002), 509–522.
- B. Bogacz et al., "Character retrieval of vectorized cuneiform script", *ICDAR 2015*, [doi:10.1109/ICDAR.2015.7333777](https://doi.org/10.1109/ICDAR.2015.7333777).
