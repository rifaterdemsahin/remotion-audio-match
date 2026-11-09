// Offset of shot B relative to shot A (negative = B started recording before A).
// Three independent measurements agree:
//   1. transcript word matching  (scripts/transcript-sync.mjs) -> -9.78 s  (±0.25)
//   2. waveform cross-correlation (scripts/sync.mjs)           -> -9.782 s
//   3. windowed waveform check    (scripts/waveform-check.mjs) -> -9.7815 s, 18/18 windows, no drift
export const B_OFFSET_SECONDS = -9.7815;
