import { RelayConfig } from './types';

// Default config — will use placeholder images until user uploads real ones
export const defaultConfig: RelayConfig = {
  frames: [
    { src: 'frame_a.png', mode: 'straight' },
    { src: 'frame_b.png', mode: 'straight' },
  ],
  speed: 0.01,
};
