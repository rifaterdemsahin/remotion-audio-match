import {AbsoluteFill, Sequence, Video, staticFile, useCurrentFrame} from 'remotion';
import {B_OFFSET_SECONDS} from './sync';

export const FPS = 30;
export type ShotId = 'A' | 'B';
export type AudioId = ShotId | 'none';

// Edit list: from `at` (seconds on the lined-up timeline) onward, show `shot` and hear `audio`.
// Edit these in Remotion Studio's props panel, or pass --props to `remotion render`.
export type Cut = {at: number; shot: ShotId; audio: AudioId};

export type MulticamProps = {
  cuts: Cut[];
  forceShot?: ShotId | 'auto'; // optional override (used by the web page's buttons)
  forceAudio?: AudioId | 'auto';
};

// Real durations (ffprobe): A = 19.40s, B = 37.72s
export const DUR_A = Math.round(19.4 * FPS);
export const DUR_B = Math.round(37.7167 * FPS);

// Lining up happens here, in Remotion: the timeline starts at whichever clip started first.
const offsetB = Math.round(B_OFFSET_SECONDS * FPS); // frames, B relative to A
export const START_A = Math.max(0, -offsetB);
export const START_B = Math.max(0, offsetB);
export const TOTAL_FRAMES = Math.max(START_A + DUR_A, START_B + DUR_B);

const aStartSec = START_A / FPS;
const aEndSec = (START_A + DUR_A) / FPS;

export const defaultProps: MulticamProps = {
  cuts: [
    {at: 0, shot: 'B', audio: 'B'}, // only B exists before A starts
    {at: aStartSec, shot: 'A', audio: 'B'}, // cut to A, keep B's audio
    {at: aEndSec, shot: 'B', audio: 'B'}, // A ends, back to B
  ],
};

const activeCut = (cuts: Cut[], frame: number): Cut => {
  const sorted = [...cuts].sort((a, b) => a.at - b.at);
  let cur = sorted[0];
  for (const c of sorted) if (c.at * FPS <= frame) cur = c;
  return cur;
};

const Layer: React.FC<{src: string; visible: boolean; audible: boolean}> = ({src, visible, audible}) => (
  <AbsoluteFill style={{opacity: visible ? 1 : 0, backgroundColor: '#000'}}>
    <Video
      src={staticFile(src)}
      volume={audible ? 1 : 0}
      style={{width: '100%', height: '100%', objectFit: 'contain'}}
    />
  </AbsoluteFill>
);

// Both clips are always mounted at their lined-up positions so they stay frame-locked.
// The cut list only changes opacity (picture) and volume (audio).
export const Multicam: React.FC<MulticamProps> = ({cuts, forceShot = 'auto', forceAudio = 'auto'}) => {
  const frame = useCurrentFrame();
  const cut = activeCut(cuts, frame);
  const shot = forceShot === 'auto' ? cut.shot : forceShot;
  const audio = forceAudio === 'auto' ? cut.audio : forceAudio;
  return (
    <AbsoluteFill style={{backgroundColor: '#000'}}>
      <Sequence name="Shot A (synced)" from={START_A} durationInFrames={DUR_A} layout="none">
        <Layer src="shot-a.mp4" visible={shot === 'A'} audible={audio === 'A'} />
      </Sequence>
      <Sequence name="Shot B (synced)" from={START_B} durationInFrames={DUR_B} layout="none">
        <Layer src="shot-b.mp4" visible={shot === 'B'} audible={audio === 'B'} />
      </Sequence>
    </AbsoluteFill>
  );
};
