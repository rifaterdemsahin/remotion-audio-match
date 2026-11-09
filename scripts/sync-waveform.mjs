// Measures how far shot B's audio is offset from shot A's by cross-correlation.
// Usage: node scripts/sync-waveform.mjs [public/video/shot-a.mp4] [public/video/shot-b.mp4]
// Prints the offset to paste into src/lib/sync.ts (positive = B starts after A).
import {execFileSync} from 'node:child_process';

const [fa = 'public/video/shot-a.mp4', fb = 'public/video/shot-b.mp4'] = process.argv.slice(2);
const SR = 8000;
const pcm = f => {
  const b = execFileSync('ffmpeg', ['-v', 'error', '-i', f, '-ac', '1', '-ar', String(SR), '-f', 'f32le', '-'], {maxBuffer: 1 << 28});
  return new Float32Array(b.buffer.slice(b.byteOffset, b.byteOffset + b.length));
};
const A = pcm(fa), B = pcm(fb);
const env = (x, w) => {
  const n = Math.floor(x.length / w), o = new Float32Array(n);
  for (let i = 0; i < n; i++) { let s = 0; for (let j = 0; j < w; j++) s += Math.abs(x[i * w + j]); o[i] = s / w; }
  const m = o.reduce((a, b) => a + b) / n;
  return o.map(v => v - m);
};
const xcorr = (a, b, min, max) => {
  const res = [];
  for (let lag = min; lag <= max; lag++) {
    let s = 0, c = 0;
    for (let i = Math.max(0, lag); i < a.length && i - lag < b.length; i++) { s += a[i] * b[i - lag]; c++; }
    res.push([lag, c > 50 ? s / Math.sqrt(c) : -Infinity]);
  }
  return res.reduce((p, q) => (q[1] > p[1] ? q : p));
};
const W = 80; // 100 Hz loudness envelope for the coarse pass
const coarse = xcorr(env(A, W), env(B, W), -3000, 3000);
const c0 = Math.round((coarse[0] / 100) * SR);
const fine = xcorr(A, B, c0 - 800, c0 + 800); // waveform-level refinement
const sec = fine[0] / SR;
console.log(`B starts ${sec.toFixed(3)}s relative to A  (= ${Math.round(sec * 30)} frames @30fps)`);
