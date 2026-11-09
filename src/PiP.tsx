import {AbsoluteFill, Easing, Sequence, Video, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {DUR_A, DUR_B, FPS, START_A, START_B, TOTAL_FRAMES, AudioId} from './Multicam';

export {TOTAL_FRAMES};
export type Corner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export type PiPProps = {
  audio: AudioId; // which clip's audio is heard
  corner: Corner; // where the inset sits
  insetWidth: number; // inset width as a fraction of the frame (0.2–0.6)
  insetSwapped: boolean; // true = A is the big picture, B the inset
};

export const pipDefaults: PiPProps = {audio: 'B', corner: 'bottom-right', insetWidth: 0.38, insetSwapped: false};

const MARGIN = 24;
const place = (corner: Corner): React.CSSProperties => ({
  [corner.startsWith('top') ? 'top' : 'bottom']: MARGIN,
  [corner.endsWith('left') ? 'left' : 'right']: MARGIN,
});

// The inset "activates" when its clip begins: it springs in with a pulsing LIVE ring,
// and shrinks away when the clip ends. Both clips play the whole time, so they stay in sync.
const Inset: React.FC<{src: string; label: string; audible: boolean; corner: Corner; width: number; dur: number}> = ({src, label, audible, corner, width, dur}) => {
  const f = useCurrentFrame(); // local to the <Sequence>, 0 = the moment this clip starts
  const {fps} = useVideoConfig();
  const enter = spring({frame: f, fps, config: {damping: 14, stiffness: 120}});
  const exit = interpolate(f, [dur - 12, dur], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.cubic)});
  const scale = enter * exit;
  const pulse = 0.5 + 0.5 * Math.sin((f / fps) * Math.PI * 2);
  const ring = interpolate(f, [0, 20], [1, 0.35], {extrapolateRight: 'clamp'}) * (0.6 + 0.4 * pulse);
  return (
    <div style={{position: 'absolute', ...place(corner), width: `${width * 100}%`, aspectRatio: '16/9', transform: `scale(${scale})`, transformOrigin: corner.replace('-', ' '), opacity: Math.min(1, scale * 1.5)}}>
      <div style={{position: 'absolute', inset: 0, borderRadius: 14, overflow: 'hidden', background: '#000', boxShadow: `0 0 0 3px rgba(255,64,64,${ring}), 0 10px 30px rgba(0,0,0,.55)`}}>
        <Video src={staticFile(src)} volume={audible ? 1 : 0} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        <div style={{position: 'absolute', top: 8, left: 8, display: 'flex', alignItems: 'center', gap: 6, padding: '3px 9px', borderRadius: 999, background: 'rgba(0,0,0,.65)', color: '#fff', font: '600 13px system-ui'}}>
          <span style={{width: 9, height: 9, borderRadius: 99, background: '#ff4040', opacity: 0.4 + 0.6 * pulse}} />
          {label}
        </div>
      </div>
    </div>
  );
};

export const PiP: React.FC<PiPProps> = ({audio, corner, insetWidth, insetSwapped}) => {
  // "base" runs the whole timeline; "inset" is the shorter clip that activates inside it.
  const base = insetSwapped ? {src: 'shot-a.mp4', id: 'A' as const, start: START_A, dur: DUR_A} : {src: 'shot-b.mp4', id: 'B' as const, start: START_B, dur: DUR_B};
  const inset = insetSwapped ? {src: 'shot-b.mp4', id: 'B' as const, start: START_B, dur: DUR_B} : {src: 'shot-a.mp4', id: 'A' as const, start: START_A, dur: DUR_A};
  return (
    <AbsoluteFill style={{backgroundColor: '#000'}}>
      <Sequence name={`Base: shot ${base.id}`} from={base.start} durationInFrames={base.dur} layout="none">
        <AbsoluteFill>
          <Video src={staticFile(base.src)} volume={audio === base.id ? 1 : 0} style={{width: '100%', height: '100%', objectFit: 'contain'}} />
        </AbsoluteFill>
      </Sequence>
      <Sequence name={`Inset: shot ${inset.id} (activates)`} from={inset.start} durationInFrames={inset.dur} layout="none">
        <Inset src={inset.src} label={`SHOT ${inset.id}`} audible={audio === inset.id} corner={corner} width={insetWidth} dur={inset.dur} />
      </Sequence>
    </AbsoluteFill>
  );
};
