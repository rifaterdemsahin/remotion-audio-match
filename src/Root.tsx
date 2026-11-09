import {Composition} from 'remotion';
import {FPS, Multicam, TOTAL_FRAMES, defaultProps} from './Multicam';

export const Root = () => (
  <Composition
    id="Multicam"
    component={Multicam}
    width={1024}
    height={576}
    fps={FPS}
    durationInFrames={TOTAL_FRAMES}
    defaultProps={defaultProps}
  />
);
