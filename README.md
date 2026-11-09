# remotion-audio-match

**▶ Live demo (GitHub Pages): https://rifaterdemsahin.github.io/remotion-audio-match/**

Multicam + audio switcher built with [Remotion](https://remotion.dev). Two shots share one timeline; cut between them and choose which clip's audio you hear.

- `src/PiP.tsx` – picture-in-picture: shot A activates inside shot B
- `src/Multicam.tsx` – the composition (both clips always mounted; `shot` = opacity, `audio` = volume, `offsetB` = line-up)
- `npm run dev` – web preview (`@remotion/player`) · `npm run studio` – Remotion Studio · `npm run render` – export mp4
- `npm run build` – builds the static site into `docs/` (served by GitHub Pages)
