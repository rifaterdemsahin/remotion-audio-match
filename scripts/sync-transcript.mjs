// Tactic 1 — transcription. Finds the offset by matching the SAME spoken words in both clips'
// Whisper word timestamps: offset = tA - tB for every shared word, then vote for the cluster.
// Usage: whisper a.wav b.wav --word_timestamps True --output_format json --output_dir tx
//        node scripts/sync-transcript.mjs tx/a.json tx/b.json
import fs from 'node:fs';

const words = f => JSON.parse(fs.readFileSync(f, 'utf8')).segments.flatMap(s => (s.words ?? []).map(w => ({
  w: w.word.toLowerCase().replace(/[^\p{L}\p{N}]/gu, ''), t: (w.start + w.end) / 2,
}))).filter(x => x.w.length >= 3);

const [fa, fb] = process.argv.slice(2);
const A = words(fa), B = words(fb);
console.log(`words: A=${A.length}  B=${B.length}`);

const votes = [];
for (const a of A) for (const b of B) if (a.w === b.w) votes.push({w: a.w, off: a.t - b.t});
if (!votes.length) { console.log('No shared words — transcripts too different to align.'); process.exit(1); }

// Histogram with 0.5s bins; the true offset shows up as one tall bin, chance matches spread out.
const bins = new Map();
for (const v of votes) { const k = Math.round(v.off / 0.5); bins.set(k, (bins.get(k) ?? 0) + 1); }
const [topK, topN] = [...bins].sort((a, b) => b[1] - a[1])[0];
const cluster = votes.filter(v => Math.abs(v.off - topK * 0.5) <= 0.5);
const offs = cluster.map(v => v.off).sort((a, b) => a - b);
const med = offs[Math.floor(offs.length / 2)];
console.log(`${votes.length} word matches; best cluster ${topN} votes (${cluster.map(v => v.w).slice(0, 8).join(', ')}…)`);
console.log(`Transcript offset (B start rel. to A): ${med.toFixed(2)}s  (±${((offs.at(-1) - offs[0]) / 2).toFixed(2)}s spread)`);
