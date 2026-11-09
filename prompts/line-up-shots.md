🎬 I added two recordings of the same event to this Remotion project:
public/video/shot-a.mp4 and public/video/shot-b.mp4. They share the same speech/audio.

🎯 GOAL
Line them up INSIDE Remotion (no manual slider), then build a composition where I can see
BOTH videos: the long one full-frame and the short one inset (picture-in-picture) that
"activates" when it starts and disappears when it ends. Also keep a cut-list composition
(cuts: {at, shot, audio}) so I can switch shots and choose which clip's audio I hear.

📦 DEPENDENCIES (check/install, do not assume)
- 🟢 Node 20+ and npm
- 🎞️ ffmpeg + ffprobe            -> brew install ffmpeg
- 🗣️ OpenAI Whisper CLI (local)  -> pip install openai-whisper  (model: large-v3-turbo, cached in ~/.cache/whisper)
- ⚛️ npm: remotion @remotion/cli @remotion/player react react-dom   (all remotion packages on the SAME version)
- 🛠️ npm dev: vite typescript @types/react @types/react-dom
  (⛔ do NOT add @vitejs/plugin-react: it hits a peer-dependency conflict; use vite's esbuild jsx: 'automatic')
- 🌐 Remotion downloads a headless Chrome on first render/still; allow it.
- 🐙 gh CLI logged in (for GitHub Pages).

🧭 TACTICS TO LINE THEM UP (use both, trust the result only if they agree)
1. 📝 Transcription: run local Whisper with word timestamps on a 16 kHz mono wav of each clip:
   whisper a.wav b.wav --model large-v3-turbo --word_timestamps True --condition_on_previous_text False --output_format json
   Match words spoken in both clips; each match votes for offset = tA - tB; take the tallest cluster.
   Accuracy is about +/-0.25 s. The small model gives gibberish on noisy speech; use large-v3-turbo.
   ⚠️ Do not force a wrong --language (let it auto-detect or set the real one).
2. 📈 Waveform: cross-correlate the audio (coarse pass on a 100 Hz loudness envelope, then a fine
   pass on 8 kHz samples). THEN verify: correlate 2 s windows across the whole overlap and confirm
   every window gives the same lag (about 1 ms). Inconsistent lags mean drift or a wrong offset.
   Check frame-rate differences (30 vs 60 fps) for drift.
✅ Report: the offset, the confidence, the evidence, and anything else you did.

🧩 IMPLEMENTATION RULES
- Store the offset in src/lib/sync.ts (negative = B started before A). Register shots in
  src/lib/timeline.ts. Place each clip with <Sequence from=...> so the timeline starts at the
  clip that began first. Round to whole frames.
- Keep both clips mounted and playing so they stay frame-locked; a cut changes only opacity (picture)
  and volume (audio).
- Use staticFile('video/shot-x.mp4'). 🔗 On GitHub Pages set window.remotion_staticBase to the page's
  base path, otherwise the videos 404 under /<repo>/.
- File pattern: video/shot-{id}.mp4, data/transcripts/shot-{id}.json, scripts/sync-*.mjs,
  src/compositions/*.tsx, src/lib/*.ts. Lowercase kebab-case.

🔍 VERIFY
- Render stills before / during / after the short clip and look at them.
- Open Remotion Studio (npm run studio) and show me the timeline.
- 🌍 Test the built page from a sub-path, not only localhost.

🚀 DELIVER
Update index.html (explain the process, include this prompt), npm run build into docs/, commit,
push, enable GitHub Pages (main, /docs), put the live link in README.md, and open it in Chrome.
