import {AbsoluteFill, Sequence, Video, staticFile} from 'remotion';

export const FPS = 30;
export type ShotId = 'A' | 'B';
export type AudioId = ShotId | 'none';

export type MulticamProps = {
  shot: ShotId; // which picture is visible
  audio: AudioId; // which clip's audio is audible
  offsetB: number; // frames: B starts this many frames after A (negative = earlier)
};

export const defaultProps: MulticamProps = {shot: 'A', audio: 'A', offsetB: 0};

// Real durations (ffprobe): A = 19.40s, B = 37.72s
export const DUR_A = Math.round(19.4 * FPS);
export const DUR_B = Math.round(37.7167 * FPS);

export const totalFrames = (offsetB: number) =>
  Math.max(DUR_A, offsetB + DUR_B) - Math.min(0, offsetB);

const Layer: React.FC<{src: string; visible: boolean; audible: boolean}> = ({src, visible, audible}) => (
  <AbsoluteFill style={{opacity: visible ? 1 : 0, backgroundColor: '#000'}}>
    <Video
      src={staticFile(src)}
      volume={audible ? 1 : 0}
      style={{width: '100%', height: '100%', objectFit: 'contain'}}
    />
  </AbsoluteFill>
);

// Both clips are ALWAYS mounted and playing, so they stay frame-locked.
// "shot" only changes opacity (the cut); "audio" only changes volume.
export const Multicam: React.FC<MulticamProps> = ({shot, audio, offsetB}) => {
  const shift = Math.max(0, -offsetB); // shift whole timeline if B starts first
  return (
    <AbsoluteFill style={{backgroundColor: '#000'}}>
      <Sequence from={shift} durationInFrames={DUR_A} layout="none">
        <Layer src="shot-a.mp4" visible={shot === 'A'} audible={audio === 'A'} />
      </Sequence>
      <Sequence from={shift + offsetB} durationInFrames={DUR_B} layout="none">
        <Layer src="shot-b.mp4" visible={shot === 'B'} audible={audio === 'B'} />
      </Sequence>
    </AbsoluteFill>
  );
};
