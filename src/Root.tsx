import {Composition} from 'remotion';
import {FPS, Multicam, defaultProps, totalFrames} from './Multicam';

export const Root = () => (
  <Composition
    id="Multicam"
    component={Multicam}
    width={1024}
    height={576}
    fps={FPS}
    durationInFrames={totalFrames(0)}
    defaultProps={defaultProps}
  />
);
