# Wedges

Find cuneiform signs by drawing them, or look them up in the [Oracc Sign List](https://oracc.museum.upenn.edu/osl/).

Draw a sign one wedge at a time and pick it from the top three candidates, build up a sequence of signs and copy it, or search for a sign by name or value. Wedges is a mobile-first web app.

**Try it at [ianparkinson.github.io/wedges](https://ianparkinson.github.io/wedges/).**

## Current limitations

- Signs are drawn and shown in one font, Noto Sans Cuneiform, so a sign is recognised only when it is drawn the way Noto writes it.
- Not every sign can be drawn yet. Those that can't can still be found with Look up.
- The skeletons used for recognition were traced by hand and are scruffy, with uneven lengths and angles, so some signs are harder to draw than they should be.

## Development

You need Node.js 26 or later (see `.nvmrc`).

```bash
npm install
npm run dev     # http://localhost:5173/wedges/, and on your local network
npm run check   # type checks, lint, format check and tests
npm run e2e     # Playwright tests on emulated phones
```

See [AGENTS.md](AGENTS.md) for how the code is organised and the rules for contributing. Every change goes through a pull request.

## Documentation

- [Stroke recognition](docs/stroke-recognition.md): how a touch trace becomes a wedge or a Winkelhaken.
- [Matching](docs/matching.md): how strokes are matched against sign skeletons and ranked.
- [Skeleton format](docs/skeleton-format.md): the spec notation for sign skeletons, and the skeleton files.
- [Sign data](docs/sign-data.md): names, values, compounds, variants and sequences from the Oracc Sign List.
- [Lookup](docs/lookup.md): how a query finds signs and sequences by name or value.
- [Prior art](docs/prior-art.md): related projects, data sources and licences.
- [Decision records](docs/decisions/): why things are the way they are.

## Credits and licence

Wedges is released under the [MIT licence](LICENSE), code and skeletons alike.

- Sign names, values and ids come from the [Oracc Sign List](https://oracc.museum.upenn.edu/osl/), released under CC0.
- The sign skeletons were traced over [Noto Sans Cuneiform](https://fonts.google.com/noto/specimen/Noto+Sans+Cuneiform), which is licensed under the SIL Open Font License 1.1. The app shows signs in the same font, bundled from [Fontsource](https://fontsource.org/fonts/noto-sans-cuneiform).
