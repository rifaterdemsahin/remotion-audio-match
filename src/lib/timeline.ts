// Single source of truth for the shots and the lined-up timeline.
// Pattern: every shot is registered here as `shot-{id}` -> public/video/shot-{id}.mp4
// and data/transcripts/shot-{id}.json. Add a shot = add a row + drop the files in.
import {B_OFFSET_SECONDS} from './sync';

export const FPS = 30;
export type ShotId = 'A' | 'B';
export type AudioId = ShotId | 'none';

// Durations from ffprobe (seconds).
export const SHOTS: Record<ShotId, {file: string; seconds: number}> = {
  A: {file: 'video/shot-a.mp4', seconds: 19.4},
  B: {file: 'video/shot-b.mp4', seconds: 37.7167},
};

export const DUR_A = Math.round(SHOTS.A.seconds * FPS);
export const DUR_B = Math.round(SHOTS.B.seconds * FPS);

// Line-up: the timeline starts at whichever clip began recording first.
const offsetB = Math.round(B_OFFSET_SECONDS * FPS); // frames, B relative to A
export const START_A = Math.max(0, -offsetB);
export const START_B = Math.max(0, offsetB);
export const TOTAL_FRAMES = Math.max(START_A + DUR_A, START_B + DUR_B);
