import {Player, PlayerRef} from '@remotion/player';
import {createRoot} from 'react-dom/client';
import {useEffect, useRef} from 'react';
import {FPS, Multicam, MulticamProps, AudioId, ShotId, defaultProps, totalFrames} from './Multicam';

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

const state: MulticamProps = {...defaultProps};
let setProps: (p: MulticamProps) => void = () => {};

const App = () => {
  const ref = useRef<PlayerRef>(null);
  useEffect(() => {
    (window as any).__player = ref.current;
  }, []);
  return (
    <Player
      ref={ref}
      component={Multicam}
      inputProps={{...state}}
      durationInFrames={totalFrames(state.offsetB)}
      fps={FPS}
      compositionWidth={1024}
      compositionHeight={576}
      style={{width: '100%', height: '100%'}}
      controls
      clickToPlay
      acknowledgeRemotionLicense
    />
  );
};

const root = createRoot($('player'));
const render = () => root.render(<App key={state.offsetB} />);
// key on offset => remount with the new duration; keep playhead
const rerender = () => {
  const p = (window as any).__player as PlayerRef | null;
  const frame = p?.getCurrentFrame() ?? 0;
  const playing = p?.isPlaying() ?? false;
  render();
  setTimeout(() => {
    const np = (window as any).__player as PlayerRef;
    np?.seekTo(Math.min(frame, totalFrames(state.offsetB) - 1));
    if (playing) np?.play();
  }, 50);
};
render();

const mk = (box: HTMLElement, items: [string, string][], get: () => string, set: (v: string) => void) => {
  const draw = () => {
    box.innerHTML = '';
    items.forEach(([v, label]) => {
      const b = document.createElement('button');
      b.textContent = label;
      b.className = get() === v ? 'on' : '';
      b.onclick = () => {set(v); draw();};
      box.appendChild(b);
    });
  };
  draw();
  return draw;
};

// Changing shot/audio only re-renders props; the player keeps playing.
const update = () => {
  const p = (window as any).__player as PlayerRef | null;
  // Player reads inputProps on re-render, so re-render the same tree (no key change)
  root.render(<App key={state.offsetB} />);
  void p;
};

const drawShot = mk($('shotBtns'), [['A', 'Shot A'], ['B', 'Shot B']], () => state.shot, v => {state.shot = v as ShotId; state.audio = state.audio; update();});
const drawAudio = mk($('audioBtns'), [['A', 'Audio A'], ['B', 'Audio B'], ['none', 'Mute']], () => state.audio, v => {state.audio = v as AudioId; update();});

$<HTMLInputElement>('offset').oninput = e => {
  const s = parseFloat((e.target as HTMLInputElement).value);
  state.offsetB = Math.round(s * FPS);
  $('offsetLabel').textContent = s.toFixed(2) + 's';
  rerender();
};

addEventListener('keydown', e => {
  const p = (window as any).__player as PlayerRef | null;
  if (e.key === '1') {state.shot = 'A'; drawShot(); update();}
  else if (e.key === '2') {state.shot = 'B'; drawShot(); update();}
  else if (e.key.toLowerCase() === 'q') {state.audio = 'A'; drawAudio(); update();}
  else if (e.key.toLowerCase() === 'w') {state.audio = 'B'; drawAudio(); update();}
  else if (e.key.toLowerCase() === 'e') {state.audio = 'none'; drawAudio(); update();}
  else if (e.key === ' ' && (e.target as HTMLElement).tagName !== 'BUTTON') {e.preventDefault(); p?.toggle();}
});
