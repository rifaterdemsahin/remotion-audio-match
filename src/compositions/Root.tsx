import {Composition} from 'remotion';
import {FPS, TOTAL_FRAMES} from '../lib/timeline';
import {Multicam, defaultProps} from './Multicam';
import {PiP, pipDefaults} from './PiP';

export const Root = () => (
  <>
    <Composition id="Multicam" component={Multicam} width={1024} height={576} fps={FPS} durationInFrames={TOTAL_FRAMES} defaultProps={defaultProps} />
    <Composition id="PiP" component={PiP} width={1024} height={576} fps={FPS} durationInFrames={TOTAL_FRAMES} defaultProps={pipDefaults} />
  </>
);
