import { HoleData, CameraState, CameraMode } from './types';

/**
 * Cameraman — controls camera motion toward hole center.
 * Always moves toward hole, NOT screen center.
 */

export const SPEED_MIN = 0.002;
export const SPEED_MAX = 0.03;
export const SPEED_DEFAULT = 0.01;

// Scale threshold at which we consider Frame B to fill the viewport
export const SWAP_SCALE_THRESHOLD = 8;

export function createCamera(): CameraState {
  return { x: 0, y: 0, scale: 1 };
}

export function resetCamera(camera: CameraState): CameraState {
  return { x: 0, y: 0, scale: 1 };
}

export function updateCamera(
  camera: CameraState,
  hole: HoleData,
  speed: number,
  _mode: CameraMode,
  containerWidth: number,
  containerHeight: number,
  deltaTime: number
): CameraState {
  const speedFactor = speed * deltaTime * 60; // normalize to ~60fps

  // Target: hole center
  const targetX = hole.centerX;
  const targetY = hole.centerY;

  let newX = camera.x;
  let newY = camera.y;
  let newScale = camera.scale;

  if (_mode === 'straight') {
    // Move directly toward hole center
    newX += (targetX - containerWidth / 2 - newX) * speedFactor * 0.5;
    newY += (targetY - containerHeight / 2 - newY) * speedFactor * 0.5;
  } else if (_mode === 'angled') {
    // Start offset, slide into hole
    const angle = Math.atan2(targetY - containerHeight / 2, targetX - containerWidth / 2);
    const offset = Math.max(0, 1 - (camera.scale - 1) / (SWAP_SCALE_THRESHOLD - 1));
    const offsetDist = 50 * offset;
    const adjustedTargetX = targetX - containerWidth / 2 + Math.cos(angle + Math.PI / 4) * offsetDist;
    const adjustedTargetY = targetY - containerHeight / 2 + Math.sin(angle + Math.PI / 4) * offsetDist;
    newX += (adjustedTargetX - newX) * speedFactor * 0.5;
    newY += (adjustedTargetY - newY) * speedFactor * 0.5;
  } else if (_mode === 'donut') {
    // Curved path toward hole
    const progress = Math.min(1, (camera.scale - 1) / (SWAP_SCALE_THRESHOLD - 1));
    const curveAngle = progress * Math.PI * 0.5;
    const radius = 80 * (1 - progress);
    const curveX = targetX - containerWidth / 2 + Math.cos(curveAngle) * radius;
    const curveY = targetY - containerHeight / 2 + Math.sin(curveAngle) * radius;
    newX += (curveX - newX) * speedFactor * 0.5;
    newY += (curveY - newY) * speedFactor * 0.5;
  }

  // Scale increases continuously
  newScale += speedFactor * 0.08 * newScale;

  return { x: newX, y: newY, scale: newScale };
}

export function shouldSwap(camera: CameraState): boolean {
  return camera.scale >= SWAP_SCALE_THRESHOLD;
}

export function getTransformStyle(
  camera: CameraState,
  hole: HoleData | null
): React.CSSProperties {
  const originX = hole ? hole.centerX : 0;
  const originY = hole ? hole.centerY : 0;

  return {
    transformOrigin: `${originX}px ${originY}px`,
    transform: `translate(${camera.x}px, ${camera.y}px) scale(${camera.scale})`,
    willChange: 'transform',
  };
}
