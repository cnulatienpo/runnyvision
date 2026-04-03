/**
 * Foreman — handles asset loading.
 * Loads next image into inactive frame (B). Unloads old image after swap.
 * Does NOT control motion. Does NOT compute geometry.
 */

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load: ${src}`));
    img.src = src;
  });
}

export function getAssetPath(filename: string, basePath: string = '/relay-assets/'): string {
  if (filename.startsWith('http://') || filename.startsWith('https://')) {
    return filename;
  }
  return `${basePath}${filename}`;
}
