// Tactic 2 — waveform check. Verifies an offset by correlating short windows of A's audio
// against B's audio around the predicted position. A true alignment shows the SAME lag in every
// window; drift or a wrong offset shows scattered/changing lags.
// Usage: node scripts/waveform-check.mjs <offsetSeconds> [a.mp4] [b.mp4]   (offset = B start rel. to A)
import {execFileSync} from 'node:child_process';

const off = parseFloat(process.argv[2] ?? '0');
const [fa = 'public/shot-a.mp4', fb = 'public/shot-b.mp4'] = process.argv.slice(3);
const SR = 8000, WIN = 2 * SR, HOP = SR, SEARCH = Math.round(0.3 * SR);
const pcm = f => { const b = execFileSync('ffmpeg', ['-v', 'error', '-i', f, '-ac', '1', '-ar', String(SR), '-f', 'f32le', '-'], {maxBuffer: 1 << 28}); return new Float32Array(b.buffer.slice(b.byteOffset, b.byteOffset + b.length)); };
const A = pcm(fa), B = pcm(fb);

const pearson = (a, ai, b, bi, n) => {
  let sa = 0, sb = 0; for (let i = 0; i < n; i++) { sa += a[ai + i]; sb += b[bi + i]; }
  const ma = sa / n, mb = sb / n; let num = 0, da = 0, db = 0;
  for (let i = 0; i < n; i++) { const x = a[ai + i] - ma, y = b[bi + i] - mb; num += x * y; da += x * x; db += y * y; }
  return da && db ? num / Math.sqrt(da * db) : 0;
};

const base = Math.round(-off * SR); // sample in B matching sample 0 of A
const rows = [];
for (let t = 0; t + WIN <= A.length; t += HOP) {
  let best = -2, bl = 0;
  for (let d = -SEARCH; d <= SEARCH; d += 2) { // step 2 samples = 0.25ms, fine enough
    const bi = base + t + d; if (bi < 0 || bi + WIN > B.length) continue;
    const r = pearson(A, t, B, bi, WIN); if (r > best) { best = r; bl = d; }
  }
  rows.push({tA: t / SR, lagMs: (bl / SR) * 1000, r: best});
}
const good = rows.filter(r => r.r > 0.15);
console.log('window(A s)  residual lag (ms)  corr');
for (const r of rows) console.log(`${r.tA.toFixed(1).padStart(6)}       ${r.lagMs.toFixed(1).padStart(8)}        ${r.r.toFixed(2)} ${r.r > 0.15 ? '' : '(weak)'}`);
const lags = good.map(r => r.lagMs).sort((a, b) => a - b);
const med = lags[Math.floor(lags.length / 2)];
console.log(`\n${good.length}/${rows.length} windows correlate (r>0.15). Median residual ${med?.toFixed(1)} ms → refined offset ${(off + med / 1000).toFixed(4)}s`);
const spread = good.length ? Math.max(...good.map(r => Math.abs(r.lagMs - med))) : NaN;
console.log(`Max deviation from median: ${spread.toFixed(1)} ms ${spread < 40 ? '(consistent: no drift)' : '(inconsistent: drift or wrong offset)'}`);
