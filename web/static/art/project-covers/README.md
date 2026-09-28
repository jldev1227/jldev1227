# Project comic covers

Eight full-bleed 1024×1536 WebP illustrations for the project issues. Cover
titles, captions, issue numbers and language controls remain live HTML; these
files deliberately contain no words or logos.

| File                             | Project                   | Camera and body direction                         |
| -------------------------------- | ------------------------- | ------------------------------------------------- |
| `segispro-cover-v2.webp`         | SEGISPRO                  | Seated side profile at an operations desk         |
| `formarpro-cover-v2.webp`        | FORMARPRO                 | Relaxed full-body profile on learning steps       |
| `transmeralda-cover-v3.webp`     | TRANSMERALDA × COTRANSMEQ | Low field view of the native driver workflow      |
| `developer-os-cover-v2.webp`     | DEVELOPER OS              | Over-the-shoulder view at mission control         |
| `gym-vancouver-cover-v2.webp`    | GYM VANCOUVER             | Candid lateral conversation in a school           |
| `manejo-comentado-cover-v1.webp` | MANEJO COMENTADO          | Rear three-quarter field review beside a road     |
| `viziona-cines-cover-v2.webp`    | VIZIONA CINES             | Seated front three-quarter view in the auditorium |
| `interest-pulse-cover-v1.webp`   | INTEREST PULSE            | Side view sorting signals into a browser panel    |

Where a `v2` exists, the original `v1` remains beside it as a reversible
art-direction checkpoint. New covers begin at `v1` and move to a new filename
instead of being overwritten because production serves art with immutable caching.

## Generation specification

Each image used the existing `julian-cover-freelancer-v1.webp` as the identity
and comic-language reference, the corresponding `/projects/*.webp` capture as
its domain reference, and two user-supplied cinematic references for natural
seated and rear-view body language. The cinematic references guide only camera
and posture; no superhero suit, emblem, web motif or recognizable character is
copied.

Shared prompt:

> A new 2:3 full-bleed premium hand-inked comic illustration featuring the same
> recognizable young Colombian freelance developer from the approved #1227
> cover: curly dark hair, rectangular glasses, natural anatomy, expressive ink,
> cross-hatching, restrained Ben-Day halftone and vintage offset texture. Use a
> candid working posture and a camera angle distinct from every other issue.
> Preserve calmer upper and lower zones for live HTML cover furniture. Image
> only: no text, logos, watermark, readable UI, superhero costume, mask, web
> motif, selfie angle, giant foreground hand or repeated crouching pose.

Project directions:

- **SEGISPRO:** side-profile medium-wide shot at an HSE command desk, typing
  while comparing a field report with operational dashboards.
- **FORMARPRO:** relaxed full-body pose seated sideways on a learning path,
  sketching on a tablet and looking thoughtfully off-frame.
- **TRANSMERALDA × COTRANSMEQ:** low field-level crouch beside a bus, reviewing
  an offline-first phone workflow with a driver while sync reaches the office.
- **DEVELOPER OS:** natural back view at a multi-monitor local mission-control
  desk, with worktrees, agent runs and validation represented in depth.
- **GYM VANCOUVER:** candid side-profile conversation with a teacher and a
  student in a warm school corridor, using a small explanatory hand gesture.
- **VIZIONA CINES:** seated front three-quarter view in an empty auditorium,
  working on a laptop beneath a purple-and-gold projector beam.
- **INTEREST PULSE:** standing three-quarter side view, sorting source signals
  into a tall browser side panel in a dark editorial signal room.

Viziona, Transmeralda v3 and Interest Pulse used the approved Julian cover as
their identity and comic-language reference, plus local product captures as
domain and palette references. The generated plates contain no words or logos;
all case-file furniture remains live HTML.

Generated with the built-in image generation tool and optimized to WebP at
quality 88 for runtime use.
