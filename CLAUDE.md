# CLAUDE.md — remotion-audio-match

Remotion project that lines up two recordings of the same event by their shared audio and shows
them as picture-in-picture or as a cut list with selectable audio.
Live: https://rifaterdemsahin.github.io/remotion-audio-match/

## Commands
- `npm run studio` — Remotion Studio (compositions `PiP`, `Multicam`; check the timeline here)
- `npm run render:pip` / `npm run render` — export `out/pip.mp4` / `out/multicam.mp4`
- `npm run dev` — web preview of the site · `npm run build` — build the site into `docs/` (GitHub Pages, branch `main`, folder `/docs`)
- `npm run sync:transcript` · `sync:waveform` · `sync:verify` — the line-up tactics (below)
- `npx tsc` must pass before committing.

## Layout and naming pattern (lowercase kebab-case, `{kind}-{id}`)
```
public/video/shot-{id}.mp4            source clips (use staticFile('video/shot-x.mp4'))
public/images/*.jpg                   images shown on the site
data/transcripts/shot-{id}.json       Whisper word timestamps per shot
scripts/sync-{method}.mjs             line-up tools: transcript, waveform, verify
src/lib/sync.ts                       THE measured offset (B_OFFSET_SECONDS)
src/lib/timeline.ts                   shot registry, FPS, durations, START_A/START_B, TOTAL_FRAMES
src/compositions/*.tsx                Root (registers), Multicam (cut list), PiP (inset)
src/web/main.tsx                      the page's player UI (not part of the video)
prompts/line-up-shots.md              the reusable prompt (rendered on index.html via ?raw)
index.html  ->  docs/                 source page / built site (docs/ is generated, commit it)
```
Add a shot: drop `video/shot-c.mp4` + transcript, add a row to `SHOTS` in `src/lib/timeline.ts`.

## How the line-up works (do not replace with a manual slider)
1. Transcription tactic: Whisper `large-v3-turbo` word timestamps, match shared words -> offset ±0.25 s.
2. Waveform tactic: cross-correlation, then 2 s windowed check (consistent lag = no drift) -> ~1 ms.
3. Trust only if both agree. Current result: B started 9.7815 s before A (-293 frames @30fps).
4. Offset lives in `src/lib/sync.ts`; clips are placed with `<Sequence from>`; both always mounted;
   a cut changes opacity (picture) / volume (audio) only.

## Gotchas
- `staticFile()` returns absolute URLs; `src/web/main.tsx` sets `window.remotion_staticBase` so videos load under the Pages sub-path. Verify the built site from a sub-path / the live URL, not just localhost.
- Do not add `@vitejs/plugin-react` (peer-dependency conflict); vite config uses esbuild `jsx: 'automatic'`.
- Keep all `remotion` / `@remotion/*` packages on the same version.
- The small Whisper model gives gibberish here; use `large-v3-turbo`.
- Studio shows a "Can't save default props" warning because defaults are imported, not inline. Harmless.
- Open local previews in Google Chrome (`open -a "Google Chrome" <url>`).

## Workflow
Make the change -> `npx tsc` -> render stills / check Studio -> `npm run build` -> commit (with the Co-Authored-By trailer) -> push -> confirm the live Pages site.
