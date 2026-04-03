import { HoleData, FrameConfig } from './types';

/**
 * Survey Guy — reads Frame A and outputs hole measurements.
 * Does NOT modify DOM. Does NOT animate. Only provides measurements.
 */

export function detectHoleFromAlpha(
  image: HTMLImageElement,
  containerWidth: number,
  containerHeight: number
): HoleData | null {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  ctx.drawImage(image, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const { data, width, height } = imageData;

  let minX = width, minY = height, maxX = 0, maxY = 0;
  let found = false;

  // Sample every 4th pixel for performance
  for (let y = 0; y < height; y += 4) {
    for (let x = 0; x < width; x += 4) {
      const idx = (y * width + x) * 4;
      const alpha = data[idx + 3];
      if (alpha < 10) { // transparent pixel
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
        found = true;
      }
    }
  }

  if (!found) return null;

  // Scale from image coordinates to container coordinates
  const scaleX = containerWidth / image.naturalWidth;
  const scaleY = containerHeight / image.naturalHeight;

  const holeX = minX * scaleX;
  const holeY = minY * scaleY;
  const holeW = (maxX - minX) * scaleX;
  const holeH = (maxY - minY) * scaleY;

  return {
    x: holeX,
    y: holeY,
    width: holeW,
    height: holeH,
    centerX: holeX + holeW / 2,
    centerY: holeY + holeH / 2,
  };
}

export function getHoleFromConfig(
  config: FrameConfig,
  image: HTMLImageElement,
  containerWidth: number,
  containerHeight: number
): HoleData | null {
  // If config has explicit hole coordinates, use those
  if (config.hole) {
    const { x, y, width, height } = config.hole;
    return {
      x,
      y,
      width,
      height,
      centerX: x + width / 2,
      centerY: y + height / 2,
    };
  }

  // Otherwise detect from alpha
  return detectHoleFromAlpha(image, containerWidth, containerHeight);
}
