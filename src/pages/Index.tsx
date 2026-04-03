import RelayPlayer from '@/relay-player/RelayPlayer';
import { RelayConfig } from '@/relay-player/types';

const config: RelayConfig = {
  frames: [
    { src: 'frame_a.png', mode: 'straight' },
    { src: 'frame_b.png', mode: 'straight' },
  ],
  speed: 0.01,
};

const Index = () => {
  return <RelayPlayer config={config} />;
};

export default Index;
