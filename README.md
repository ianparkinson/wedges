# Wedges

Find cuneiform signs by drawing them, or look them up in the [Oracc Sign List](https://oracc.museum.upenn.edu/osl/).

Draw a sign one wedge at a time and pick it from the top three candidates, build up a sequence of signs and copy it, or search for a sign by name or value. Wedges is a mobile-first web app.

**Status:** in development. The live site at https://ianparkinson.github.io/wedges/ is a placeholder for now.

## Development

You need Node.js 22 or later.

```bash
npm install
npm run dev     # http://localhost:5173/wedges/
npm run check   # type checks, lint, format check and tests
npm run e2e     # Playwright tests on emulated phones
```

See [AGENTS.md](AGENTS.md) for how the code is organised and the rules for contributing. Every change goes through a pull request.

## Documentation

- [Prior art](docs/prior-art.md): related projects, data sources and licences.
- [Decision records](docs/decisions/): why things are the way they are.

## Credits and licence

Wedges is released under the [MIT licence](LICENSE), code and templates alike.

- Sign names, values and ids come from the [Oracc Sign List](https://oracc.museum.upenn.edu/osl/), released under CC0.
- The sign templates were traced over [Noto Sans Cuneiform](https://fonts.google.com/noto/specimen/Noto+Sans+Cuneiform), which is licensed under the SIL Open Font License 1.1.
