export interface HoleData {
  x: number;
  y: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
}

export type CameraMode = 'straight' | 'angled' | 'donut';

export interface FrameConfig {
  src: string;
  mode?: CameraMode;
  hole?: { x: number; y: number; width: number; height: number };
}

export interface RelayConfig {
  frames: FrameConfig[];
  speed: number;
}

export interface CameraState {
  x: number;
  y: number;
  scale: number;
}

export interface DebugInfo {
  speed: number;
  frameIndex: number;
  hole: HoleData | null;
  camera: CameraState;
  fps: number;
  source: string;
  systemRunning: boolean;
  assetLoaded: [boolean, boolean];
}
