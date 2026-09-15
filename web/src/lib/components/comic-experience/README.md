# Comic archive component contract

The homepage archive progressively enhances ordinary project links. It owns
presentation state but never replaces canonical mission routes or project data.

```text
ComicExperience.svelte     browse/read orchestration, history and pickup lock
ComicBoxSelector.svelte    semantic comic collection aligned to the box
ComicVolume.svelte         one canonical issue link
FirstPersonHands.svelte    raster poses behind a future Rive adapter
experience-state.ts        pure browse/read reducer
StPageFlipReader.svelte    isolated page-flip DOM and lifecycle boundary
```

Rules:

- Application state is exactly `browse` or `read`.
- Pickup is a temporary presentation phase, not another state.
- Selection goes directly from the box to a readable StPageFlip cover.
- There is no inspector, back-cover control, or separate open/read button.
- The only persistent experience button while reading returns the issue to the
  box; page corners and arrow keys navigate the issue.
- Every volume remains an ordinary anchor until hydration succeeds.
- The outer experience owns `#issue/pN`; StPageFlip emits page numbers only.
- Returning restores focus to the selected issue.
- `StPageFlipReader` must dynamically import and destroy its engine.
- `ComicReader.svelte` remains the standalone mission-route fallback.

Read `web/docs/comic-reader/LIBRARY-INTERACTION.md` before changing the flow.
