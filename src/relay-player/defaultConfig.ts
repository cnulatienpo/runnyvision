import { RelayConfig } from './types';
import pngPaths from 'virtual:png-list';

const allSrcs = [...(pngPaths as string[])];

// Fisher-Yates shuffle
for (let i = allSrcs.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [allSrcs[i], allSrcs[j]] = [allSrcs[j], allSrcs[i]];
}

const frames = allSrcs.map(src => ({ src, mode: 'straight' as const }));

export const defaultConfig: RelayConfig = {
  frames,
  speed: 0.01,
};
