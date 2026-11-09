import {Player, PlayerRef} from '@remotion/player';
import {createRoot} from 'react-dom/client';
import {useEffect, useRef, useState} from 'react';
import {AudioId, FPS, Multicam, ShotId, TOTAL_FRAMES, defaultProps} from './Multicam';
import {PiP, pipDefaults} from './PiP';

const Pick = <T extends string>({label, value, items, onChange}: {label: string; value: T; items: [T, string][]; onChange: (v: T) => void}) => (
  <div className="row">
    <label className="t">{label}</label>
    {items.map(([v, text]) => (
      <button key={v} className={v === value ? 'on' : ''} onClick={() => onChange(v)}>{text}</button>
    ))}
  </div>
);

const App = () => {
  const ref = useRef<PlayerRef>(null);
  const [shot, setShot] = useState<ShotId | 'auto'>('auto');
  const [audio, setAudio] = useState<AudioId | 'auto'>('auto');
  const [mode, setMode] = useState<'cut' | 'pip'>('pip');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'BUTTON' && e.key === ' ') return;
      const k = e.key.toLowerCase();
      if (k === '1') setShot('A'); else if (k === '2') setShot('B'); else if (k === '0') setShot('auto');
      else if (k === 'q') setAudio('A'); else if (k === 'w') setAudio('B'); else if (k === 'e') setAudio('none'); else if (k === 'r') setAudio('auto');
      else if (e.key === ' ') { e.preventDefault(); ref.current?.toggle(); }
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="card">
      <div id="player">
        <Player
          ref={ref}
          key={mode}
          component={(mode === 'pip' ? PiP : Multicam) as any}
          inputProps={mode === 'pip' ? {...pipDefaults, audio: audio === 'auto' ? pipDefaults.audio : audio} : {...defaultProps, forceShot: shot, forceAudio: audio}}
          durationInFrames={TOTAL_FRAMES}
          fps={FPS}
          compositionWidth={1024}
          compositionHeight={576}
          style={{width: '100%', height: '100%'}}
          controls
          clickToPlay
          acknowledgeRemotionLicense
        />
      </div>
      <Pick label="Mode" value={mode} onChange={setMode} items={[['pip', 'Picture-in-picture'], ['cut', 'Cut between shots']]} />
      {mode === 'cut' && <Pick label="Shot" value={shot} onChange={setShot} items={[['auto', 'Auto (cut list)'], ['A', 'Shot A'], ['B', 'Shot B']]} />}
      <Pick label="Audio" value={audio} onChange={setAudio} items={[['auto', 'Auto (cut list)'], ['A', 'Audio A'], ['B', 'Audio B'], ['none', 'Mute']]} />
      <p className="mut" style={{margin: '4px 0 0'}}>
        Keys: <code>1</code>/<code>2</code>/<code>0</code> shot A/B/auto · <code>Q</code>/<code>W</code>/<code>E</code>/<code>R</code> audio A/B/mute/auto · <code>Space</code> play/pause.
      </p>
    </div>
  );
};

createRoot(document.getElementById('app')!).render(<App />);
