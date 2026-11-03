# Sample format

> **Carried over from the prototype.** This document describes the algorithms in
> [cuneiforminputprototype](https://github.com/ianparkinson/cuneiforminputprototype),
> which Wedges ports to TypeScript in milestone 2. Until then, file names such as
> `signs.js` refer to the prototype. Each port updates the names here to the new
> modules in `src/core/` (see [AGENTS.md](../AGENTS.md)).

A **sample** is one drawing of a sign: its strokes, normalised to a standard frame. Sign templates in `signs.js`, tracings saved in the browser, export files and the claude.ai backup all describe samples with the same **spec** notation. This document defines that notation and each container it appears in.

## Coordinate frame

- Coordinates are on a **0–10 grid**, x to the right and **y downward** (as on screen).
- Drawn samples are normalised before being written: the bounding box of all key points (wedge ends, Winkelhaken vertices and leg ends) is centred and scaled so its longer side runs from 0 to 10. The shorter side is centred around 5. For example, a sign twice as wide as it is tall spans x 0–10 and y 2.5–7.5.
- Values are rounded to 0.1, which is 1% of the sign's size.
- Hand-written templates may use any placement within the grid. The matcher normalises every sample again when loading it ([matching.md](matching.md)), so only relative positions matter.

## Spec notation

A spec is a list of strokes separated by semicolons. Each stroke is an operation code followed by numbers, separated by spaces:

```
spec   = stroke *( ";" [space] stroke )
stroke = op 1*( space number )
number = decimal, optionally negative, e.g. 3 | 0.5 | 10 | -0.2
```

Whitespace around semicolons is ignored. Empty items are skipped.

### Wedges

A wedge has a **head**, the triangular end and the first point drawn, and a **tail**.

| Op | Arguments | Head | Tail |
|---|---|---|---|
| `h` | x y L | (x, y) | (x + L, y): horizontal, pointing right |
| `v` | x y L | (x, y) | (x, y + L): vertical, pointing down |
| `d` | x y L | (x, y) | (x + L/√2, y + L/√2): diagonal, down-right |
| `u` | x y L | (x, y) | (x + L/√2, y − L/√2): diagonal, up-right |
| `l` | x1 y1 x2 y2 | (x1, y1) | (x2, y2): any direction |

### Winkelhaken

A Winkelhaken has a **vertex** (its point) and two **leg ends**.

| Op | Arguments | Vertex | Leg ends |
|---|---|---|---|
| `w` | x y s | (x, y) | (x + s, y − 0.7s) and (x + s, y + 0.7s): opening to the right, about 70° between the legs |
| `k` | vx vy ax ay bx by | (vx, vy) | (ax, ay) and (bx, by): any shape and orientation |

### Which ops are used where

- **Saved drawings** (browser storage, backups, exports) use only `l` and `k`. They record exactly what was drawn.
- **Templates in `signs.js`** are cleaned up on import (see [Import rules](#import-rules)):
  - wedges within 8° of horizontal or vertical become `h` or `v`
  - Winkelhaken opening within 30° of rightwards become `w`
  - everything else stays `l` or `k`
- `d` and `u` appear only in hand-written templates (there are none at present).

### Example

AN, traced: a vertical, a horizontal, and two diagonals crossing at the centre.

```
v 5.1 0.1 9.9; h 0 4.7 10; l 1.4 1.1 8.7 8.1; l 1.4 8 8.8 0.9
```

### Parsing

`parseSpec()` in `signs.js` turns a spec into strokes: `{type: 'wedge', a, b}` or `{type: 'wh', v, a, b}`, with `a` the head of a wedge. An unknown op is an error. `specFromPrims()` does the reverse for drawn strokes, normalising and writing `l`/`k` at 0.1 precision.

## Containers

### `signs.js` entries

```js
{ char: '\u{1202D}', name: 'AN', spec: 'v 5.1 0.1 9.9; h 0 4.7 10; …' }
{ char: '\u{1240F}', name: 'FOUR U (40)', spec: '…', approx: true }
```

| Field | Meaning |
|---|---|
| `char` | the Unicode character (a single codepoint) |
| `name` | display name (from the Unicode name in conventional spelling, see `tools/make_queue.py`) |
| `spec` | the template |
| `approx` | optional; marks a hand-written template whose form is uncertain |

There's one entry per character, in the order they were imported. A `// ---- Hand-encoded ----` marker line ends the traced entries; hand-written templates would go after it. There are none at present: the early hand-encoded templates didn't match the Noto glyphs and were removed and retraced in October 2026. A future version could allow several entries per character for variant forms, since the matcher already supports several samples per sign.

### Export file (version 2)

Produced by **Export new tracings** (training panel) and **Export all** (Teach panel). It's UTF-8 JSON with one sample per line, so it diffs and reads easily:

```json
{"format":"cuneiform-samples","version":2,"set":"new","exported":"2026-10-22T16:20:38.027Z","samples":[
  {"char":"𒀁","name":"A×A","spec":"l 0 2.3 10 2.5; l 4.2 0 4.3 10; k 6.2 5.8 8.5 4.2 8.5 7.3"},
  {"char":"𒀺","name":"AŠ KABA TENU","spec":"l 0 4.9 10 5.1"}
]}
```

| Field | Meaning |
|---|---|
| `format` | always `"cuneiform-samples"` |
| `version` | `2` |
| `set` | what was exported: `"new"` (new tracings) or `"all"` (every sample in the browser) |
| `exported` | ISO 8601 timestamp, UTC |
| `samples[].char` | the character |
| `samples[].name` | display name at the time of tracing |
| `samples[].spec` | `l`/`k` spec |

Export file names:
- `cuneiform-traced-YYYY-MM-DD-HHMMSS.json` (local time) for new tracings
- `cuneiform-samples.json` for everything

**What "new tracings" includes:** the latest sample of every character that isn't in `signs.js` yet, plus the latest deliberate retracing of a character that is. Test me drawings and imported samples are left out, so they can't replace a template.

**Version 1** (legacy, still accepted on import): a bare JSON array of `{char, name, prims}`. `prims` are stroke objects with coordinates normalised to a box whose longer side is 1 and whose centre is at the origin, i.e. grid ÷ 10 − 0.5.

### Browser storage

`localStorage` key `cuneiformentry.samples.v2` holds a JSON array of records:

| Field | Meaning |
|---|---|
| `id` | unique id: base-36 milliseconds, `-`, 6 random base-36 characters, e.g. `mvjslcl8-8saadj`. Also the backup document id |
| `t` | save time, milliseconds since 1970 |
| `char`, `name`, `spec` | as in the export file |
| `traced` | `true` for a deliberate tracing: training without Test me, or the Teach panel. Absent for Test me drawings and imported samples |
| `synced` | `true` once the record is in the claude.ai backup |

Other keys:
- `cuneiformentry.training.v2`: training position per set, Test me state, running test score
- `cuneiformentry.pendingDeletes.v1`: ids still to delete from the backup
- `cuneiformentry.samples.v1`: the version 1 store, converted to version 2 on first load and then left untouched

The browser copy is the working copy: saving never needs a network connection.

### claude.ai backup

When the app runs as the claude.ai artifact, each record is also written to the artifact's database:

- **collection:** `samples`
- **document id:** the sample's `id`
- **document body:** `{char, name, spec, traced: boolean, t}`

Unsynced records are retried when the connection comes back and every 60 seconds while any are waiting. On load, the page reads the collection in order of `t` and adds any records missing from the browser, for example after browser data was cleared or when opening the page on another device. Deleting samples in the app deletes their documents too; deletions made offline are queued.

Claude reads this collection to merge new tracings into `signs.js`. When doing so, it applies the same rule as **Export new tracings**: a record with `traced: false` must not replace an existing `signs.js` entry.

## Import rules

`tools/import_samples.py <file> [--write]` merges an export file, version 1 or 2, into `signs.js`. Without `--write` it only reports what it would do.

1. If a character appears more than once, the **last** sample wins. Exports list samples in save order, so that's the latest drawing.
2. Each sample is cleaned up:
   - a wedge within **8°** of horizontal or vertical becomes `h`/`v`. For `h`, the head's x is kept, y is the average of the two ends' y, and the length is the x distance; `v` works the same way with x and y swapped
   - a Winkelhaken whose opening is within **30°** of rightwards becomes `w x y s`, with s = mean leg length ÷ √(1 + 0.7²)
   - other strokes become `l`/`k`; all numbers are rounded to 0.1
3. A character already in `signs.js` has its entry removed and replaced with the new one at the end of the traced section, before the hand-encoded section. Otherwise the new entry is added there.
4. The tool reports how many signs are new and which existing ones were replaced.

Re-importing a file produces the same entries, but moves them to the end of the traced section, so their order can change.

## Related generated data

These aren't samples, but sit beside them:

| File | Generated by | Contents |
|---|---|---|
| `signs-queue.js` | `tools/make_queue.py` | training sets: `[{id, label, signs: [{char, name}]}]`. In order: `common`; `retrace` (signs whose templates were removed for retracing, listed in the tool); `simple` (main-block signs that the Oracc Sign List doesn't treat as compounds, i.e. whose name isn't written in bars, like \|A×BAD\|); `numbers` (U+12400–U+1247F); then batches `b01`… of 50 in codepoint order. The batches are fixed once made: the tool copies them from the existing file when it regenerates the others |
| `sign-info.js` | `tools/make_sign_info.py` | `SIGN_INFO[char] = {n: OSL name, o: OSL id, v: [values], of?: parent sign}` from the Oracc Sign List; the page is `https://oracc.museum.upenn.edu/osl/<o>` |

## Notes for a production format

- **Script style:** add a `style` or `period` field (for example `noto`, `neo-assyrian`), so variant templates can be told apart, filtered and credited.
- **Contributors:** add a `source` field (who drew it, and with what reference) once samples come from more than one person.
- **Rounding:** 0.1 precision is enough for matching. Keep raw traces, with timestamps and pressure, separately if they'll be wanted for training models later.
- **JSON Schema:** the export file is simple enough to define with one. Keeping the `format` and `version` fields lets readers reject files they don't understand.
