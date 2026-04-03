import { RelayConfig } from './types';

const frameCount = 108;
const frames = Array.from({ length: frameCount }, (_, i) => ({
  src: `/pngs/f_${String(i).padStart(4, '0')}.png`,
  mode: 'straight' as const,
}));

export const defaultConfig: RelayConfig = {
  frames,
  speed: 0.01,
};
