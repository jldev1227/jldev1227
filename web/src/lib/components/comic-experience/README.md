# Comic archive component contract

The homepage archive progressively enhances ordinary issue links. It owns
presentation state but never replaces canonical mission routes or project data.

```text
ComicExperience.svelte     browse/read orchestration, history, the modal reader
ComicGrid.svelte           the collection as a grid of covers, one tab stop
ComicVolume.svelte         one cover: an ordinary anchor to the issue's route
experience-state.ts        pure browse/read reducer
ComicReader.svelte         the hand-written book: sheets, drag, keys, reflow
CaseFilePage.svelte        the six pages of a case file, shared with its route
```

Rules:

- Application state is exactly `browse` or `read`.
- Selecting a cover opens the issue in a native `<dialog>` over the grid,
  already on its cover. There is no box, no hands, no pickup animation, no
  inspector and no page-turn library: the book is `ComicReader`, the same
  sheets the mission routes turn.
- The grid stays mounted underneath: closing the issue — the button, Escape,
  browser Back — returns focus to the cover it came from.
- The only persistent reader chrome is the localized close button; page
  corners, touch and arrow keys navigate the issue.
- Every volume remains an ordinary anchor until hydration succeeds, and the
  grid is one tab stop only once it is enhanced.
- The outer experience owns `#issue/pN`; the reader reports the leading page
  and is told where to open (`manageHash={false}`, `initialPage`).
- The modal measures the room and gives the reader the width at which the
  book fits it in both dimensions.
- The introductory issue is the only one with an illustrated cover and tells
  who is writing; every case file is an issue of its own, printing the same six
  pages as its canonical route through `CaseFilePage`.
- `ComicReader.svelte` is also the standalone mission-route reader.

Read `web/docs/comic-reader/LIBRARY-INTERACTION.md` before changing the flow.
