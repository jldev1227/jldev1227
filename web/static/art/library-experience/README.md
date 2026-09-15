# Archive backdrop

The home page lays the collection out over one blurred backdrop. The box, the
hands and the painted room that preceded it were removed with the grid; only
the backdrop remains.

| Runtime file  | Dimensions | Alpha | Role                                   |
| ------------- | ---------: | ----- | -------------------------------------- |
| `bg-room.jpg` |  3840×2160 | no    | Full-viewport backdrop behind the grid |

- `object-fit: cover; object-position: center`, under a vignette the component
  draws itself.
- Nothing interactive is painted into it: every cover on the grid is real HTML.
