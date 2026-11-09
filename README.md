# remotion-audio-match

**▶ Live demo (GitHub Pages): https://rifaterdemsahin.github.io/remotion-audio-match/**

Multicam + audio switcher built with [Remotion](https://remotion.dev). Two shots share one timeline; cut between them and choose which clip's audio you hear.

- `src/PiP.tsx` – picture-in-picture: shot A activates inside shot B
- `src/Multicam.tsx` – the composition (both clips always mounted; cut list `cuts` drives shot = opacity and audio = volume; the line-up offset lives in `src/sync.ts`)
- `npm run dev` – web preview (`@remotion/player`) · `npm run studio` – Remotion Studio · `npm run render` – export mp4
- `npm run build` – builds the static site into `docs/` (served by GitHub Pages)

## How to prompt Claude to line up shots in Remotion (next time)

Give Claude the files and say *what is shared*, *what you want to see*, and *how to prove the sync*. Copy and adapt:

```text
I added two recordings of the same event to this Remotion project:
public/shot-a.mp4 and public/shot-b.mp4 (they share the same speech/audio).

1. Line them up INSIDE Remotion, not with a manual slider. Measure the offset with two tactics:
   a. transcription: run local Whisper (large-v3-turbo, word timestamps) on both and match shared words;
   b. waveform: cross-correlate the audio, then check 2s windows across the overlap for consistency/drift.
   Only trust the result if both agree, and tell me the offset, the confidence and anything else you did.
2. Store the offset in src/sync.ts and place each clip with <Sequence from=...> so the timeline starts
   at whichever clip began first.
3. Build a composition where I can see BOTH videos: <the long one> full-frame and <the short one>
   inset (picture-in-picture) that activates when it starts and disappears when it ends.
   Also keep a cut-list composition (cuts: {at, shot, audio}) so I can switch shots and pick the audio.
4. Verify by rendering stills at frames before / during / after the short clip, then open
   Remotion Studio so I can see the timeline.
5. Update index.html to explain the process, rebuild into docs/, commit, push, and put the
   GitHub Pages link in the README.
```

Tips for a good result:
- **Say the audio is shared.** That is what makes automatic alignment possible; with unrelated audio you'd have to sync by a visual cue (a clap, a flash) instead.
- **Name both tactics.** Transcription finds roughly where (±0.25 s); the waveform finds exactly where (~1 ms); agreement proves it.
- **Ask for the evidence**, not just the answer: offset, drift check, still frames.
- **Mention fps differences** (here 30 vs 60 fps) so Claude checks for drift.
- **Say what you want to see and hear**: which shot is the base, where the inset goes, which clip's audio plays.
- **Re-measure, don't guess**: if you swap in new clips, run `npm run sync:transcript`, `npm run sync:waveform`, `npm run sync:verify`, then update `src/sync.ts`.
