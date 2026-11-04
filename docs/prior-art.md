# Prior art

A survey of existing work related to entering cuneiform by drawing, carried out in October 2026. It covers what exists, what we can reuse, and where this project differs. Details marked as verified were checked against the project's source code or data. The rest comes from project pages, abstracts and search results.

## Summary

Only one project closely matches this project's aim: CuneiPainter, an Android app from 2020. It recognises drawn wedges, but matches signs only by counting wedge types, ignoring where the wedges are. Nothing current that we found lets a user draw a sign and get back the Unicode character by matching wedge positions.

Plenty of nearby work exists: ways of describing a sign's wedges in text, search by written description, recognition from photos and 3D scans of tablets, and sign lists. The Oracc Sign List is the main reusable data source and is already used here.

## Drawing input

### CuneiPainter (verified)

- **What it is:** an open-source Android app by Timo Homburg ([github.com/situx/CuneiPainter](https://github.com/situx/CuneiPainter)). You draw a sign with your finger and it lists candidate signs.
- **Status:** GPL-3.0. The last commit was on 6 October 2020, and the repository had 10 stars.
- **Stroke recognition:** each stroke is classified by the slope of its start-to-end line into one of Gottstein's four types: A (horizontal), B (vertical) and the two diagonals, C and D. A Winkelhaken is treated as type C, a short diagonal, not as an angle you draw (`DrawingCanvas.java`).
- **Matching:** it counts strokes of each type to build a Gottstein code such as `a1b2`, and looks that code up in a table (`app/src/main/assets/strokes_gott.json`). Wedge positions are ignored, so every sign with the same counts is a tie. The code has started computing spatial relations between strokes for PaleoCodage (`LocationCalc.java`), but that isn't finished.
- **Relevance:** it confirms the idea is natural and has been tried. Counting wedge types alone can't tell apart the many signs that share counts, which is why Wedges matches wedge geometry.

## Ways of describing a sign's wedges

### Gottstein system

- **What it is:** Norbert Gottstein (2012) describes each sign by how many wedges of each type it has. It was designed to help beginners find a sign by its appearance rather than its position in a sign list. It covers mainly Middle and Neo-Assyrian signs ([CDLN 2015:17](https://cdli.earth/articles/cdln/2015-17)).
- **Relevance:** useful as a pre-filter or a cross-check on templates. It can't be a template itself, since it records no positions. We didn't find a machine-readable list of codes.

### PaleoCodage (verified)

- **What it is:** a text notation by Timo Homburg, modelled on the Manuel de Codage used for Egyptian hieroglyphs ([DH2019 abstract](https://dh-abstracts.library.virginia.edu/works/9865); _Digital Scholarship in the Humanities_ 2021, DOI 10.1093/llc/fqab038). It encodes wedge types and how wedges relate to each other: beside, beneath, crossing, rotated, smaller.
- **Data:** [github.com/situx/PaleoCodage](https://github.com/situx/PaleoCodage) (GPL-3.0, last updated October 2022) contains `js/paleocodes.js`, which encodes 380 signs. Each has its codepoint, transliteration, Borger number and a PaleoCode string such as `a-b-w-a:a`. `js/paleocodage.js` draws those codes.
- **Relevance:** the only dataset we found that describes how a sign's wedges are laid out, covering about a third of Unicode. It could generate starting templates without tracing, but they would be rough, because the notation records relations, not exact positions. Using its data or code would probably require this project to be released under the GPL too.

### Recursive encoding

- **What it is:** Daniel M. Stelzer, _A Recursive Encoding for Cuneiform Signs_ ([arXiv:2406.17283](https://arxiv.org/abs/2406.17283), 2024). A notation for how strokes are arranged, used to look signs up by any distinctive part and to draw signs on screen.
- **Relevance:** an alternative to PaleoCodage. We found no published dataset.

## Search by appearance

- **Query-by-eXpression** (Rusakov et al. 2020, TU Dortmund, [abstract](https://web.patrec.cs.tu-dortmund.de/pubs/abstracts/Rusakov2020-TQX.htm)): finds sign images from a written description of their wedges, built on Gottstein codes and extended with hints such as crossings and relative positions. It's a research method; we found no public tool or data.
- **Würzburg Palaeographicum** ([hethport.uni-wuerzburg.de/palaeographicum](https://www.hethport.uni-wuerzburg.de/palaeographicum)): a Hittite palaeography site whose searches include one by how the wedges are arranged.
- **Andrew Senior's sign search** ([andrewsenior.com/cuneify/sign_data.html](https://andrewsenior.com/cuneify/sign_data.html)): finds signs by appearance using filters. Its stroke counts come from the Neo-Assyrian _CuneiformNA_ font. There's no drawing input.
- **eBL sign tools** ([ebl.lmu.de/tools/signs](https://www.ebl.lmu.de/tools/signs)): sign search with palaeographic details. No drawing input.

## Recognition from photos and scans

A mature research area, but a different problem: finding and identifying signs in photos or 3D scans of tablets, not in deliberate drawings.

- **Wedge-based matching:** Bogacz et al. describe each wedge with a set of geometric measurements and match signs by solving a pairing problem between their wedges ([ICDAR 2015](https://unpaywall.org/10.1109/ICDAR.2015.7333777)). That's the same method as our matcher, which is some reassurance that it's sound. See also the survey _Digital Assyriology—Advances in Visual Cuneiform Analysis_ ([ACM 2022](https://dl.acm.org/doi/full/10.1145/3491239)).
- **Deep learning on images:** [PLOS ONE 2020](https://journals.plos.org/plosone/article?id=10.1371%2Fjournal.pone.0243039) (sign detection trained from transliterations), [eBL OCR pipeline 2026](https://arxiv.org/pdf/2606.22608) and a [2025 review](https://arxiv.org/pdf/2506.19208).
- **3D scans:** GigaMesh extracts wedges from 3D models of tablets.

## Keyboards and input methods

- **Cuneiform Edit** ([App Store](https://apps.apple.com/app/id982345596)): an iOS text editor with its own cuneiform keyboard, where you tap signs rather than draw them.
- We found no Android cuneiform keyboard, and no built-in cuneiform input on either platform.

## Data sources

- **Oracc Sign List (OSL)**: [oracc.museum.upenn.edu/osl](https://oracc.museum.upenn.edu/osl/), with the source at [github.com/oracc/osl](https://github.com/oracc/osl) (`00lib/osl.asl`). It's public domain (CC0) and covers 1,225 of the 1,234 Unicode cuneiform characters. Each sign has a name, values (readings), Unicode mapping, numbers in other sign lists (MZL, ABZL, HZL…), and links to eBL and Wikidata. Wedges uses it for sign names, values and links.
- **ORACC and CDLI corpora**: transliterated texts, the obvious source for sign frequency counts if ranking ever weights candidates by how common they are. Neither gives counts per Unicode character directly; you'd map readings to signs through OSL. Frequencies also vary a lot by period, language and genre.
- **Fonts**: Noto Sans Cuneiform (SIL Open Font License) was used as the tracing reference for the sign templates. Its signs are drawn as single merged outlines, not separate wedges, so templates can't be pulled out of it automatically. Fonts in other styles, such as the Neo-Assyrian Assurbanipal font, could serve as references for variant templates.

## How this project relates to it

- **No code or data reused from other projects.** CuneiPainter's source was read only to describe it here, after the matcher had been written. Nothing from CuneiPainter or PaleoCodage is used, so their GPL licences don't apply.
- **Data the project is built on:**
  - the templates were traced over Noto Sans Cuneiform glyphs (SIL Open Font License)
  - sign names and values come from the Oracc Sign List (CC0)
  - character names come from the Unicode Character Database
- **Ideas with precedents, credited in the README:**
  - CuneiPainter: drawing wedges on a phone to identify a sign
  - the Gottstein system: the wedge-type classification
  - Bogacz et al. (2015): matching wedges by solving a pairing problem
  - Kuhn and Munkres: the assignment algorithm itself
- **What's new is the combination,** applied to typing Unicode:
  - the drawing conventions (wedges from the head, a Winkelhaken as a single angle)
  - a stroke classifier that tolerates flicks
  - pairing that also allows extra and missing strokes and reversed wedges
  - templates traced over a reference font, covering all of Unicode

## What this means for a production version

- **The gap is real:** existing systems either count wedge types (CuneiPainter, Gottstein), need a written description (QbX), or work on photos. Matching drawn wedge geometry is what sets this project apart.
- **Licensing:** OSL is CC0 and safe to bundle. CuneiPainter and PaleoCodage are GPL-3.0, so reusing their data or code commits the project to the GPL.
- **Script styles:** reference fonts and sign lists follow particular periods. Users trained in Neo-Assyrian will draw some signs quite differently from the Noto glyphs. A production database needs several samples for those signs, which the template format allows.
