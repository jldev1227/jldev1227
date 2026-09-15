# Project comic covers

Five full-bleed 1024×1536 WebP illustrations for the project issues. Cover
titles, captions, issue numbers and language controls remain live HTML; these
files deliberately contain no words or logos.

| File                          | Project                   | Camera and body direction                       |
| ----------------------------- | ------------------------- | ----------------------------------------------- |
| `segispro-cover-v2.webp`      | SEGISPRO                  | Seated side profile at an operations desk       |
| `formarpro-cover-v2.webp`     | FORMARPRO                 | Relaxed full-body profile on learning steps     |
| `transmeralda-cover-v2.webp`  | TRANSMERALDA × COTRANSMEQ | Rear three-quarter walking through the bus yard |
| `developer-os-cover-v2.webp`  | DEVELOPER OS              | Over-the-shoulder view at mission control       |
| `gym-vancouver-cover-v2.webp` | GYM VANCOUVER             | Candid lateral conversation in a school         |

The original `v1` set remains beside these files as a reversible art-direction
checkpoint. The application uses `v2`.

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
- **TRANSMERALDA × COTRANSMEQ:** rear three-quarter walking pose between two
  transport streams, tablet held low and face visible only in profile.
- **DEVELOPER OS:** natural back view at a multi-monitor local mission-control
  desk, with worktrees, agent runs and validation represented in depth.
- **GYM VANCOUVER:** candid side-profile conversation with a teacher and a
  student in a warm school corridor, using a small explanatory hand gesture.

Generated with the built-in image generation tool and optimized to WebP at
quality 88 for runtime use.
