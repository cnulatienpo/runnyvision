import React, { useRef, useEffect, useState, useCallback } from 'react';
import { RelayConfig, HoleData, CameraState, DebugInfo, CameraMode } from './types';
import { getHoleFromConfig } from './surveyGuy';
import {
  createCamera,
  resetCamera,
  updateCamera,
  shouldSwap,
  getTransformStyle,
  SPEED_DEFAULT,
} from './cameraman';
import { loadImage, getAssetPath } from './foreman';
import DebugPanel, { HoleOverlay } from './DebugPanel';
import { defaultConfig } from './defaultConfig';

interface RelayPlayerProps {
  config?: RelayConfig;
}

const RelayPlayer: React.FC<RelayPlayerProps> = ({ config = defaultConfig }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const frameARef = useRef<HTMLDivElement>(null);
  const frameBRef = useRef<HTMLDivElement>(null);

  // Core state
  const stateRef = useRef({
    camera: createCamera(),
    hole: null as HoleData | null,
    speed: config.speed || SPEED_DEFAULT,
    frameIndex: 0,
    isFrameAFront: true,
    images: [null, null] as (HTMLImageElement | null)[],
    running: false,
    lastTime: 0,
    fps: 0,
    fpsFrames: 0,
    fpsLastTime: 0,
  });

  const [debugVisible, setDebugVisible] = useState(true);
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    speed: config.speed || SPEED_DEFAULT,
    frameIndex: 0,
    hole: null,
    camera: createCamera(),
    fps: 0,
    source: 'local',
    systemRunning: false,
    assetLoaded: [false, false],
  });

  const getContainerSize = useCallback(() => {
    if (!containerRef.current) return { w: window.innerWidth, h: window.innerHeight };
    return { w: containerRef.current.clientWidth, h: containerRef.current.clientHeight };
  }, []);

  // Detect hole from current front frame image
  const detectHole = useCallback(() => {
    const s = stateRef.current;
    const frontImg = s.isFrameAFront ? s.images[0] : s.images[1];
    if (!frontImg) return;
    const { w, h } = getContainerSize();
    const frameConfig = config.frames[s.frameIndex];
    if (!frameConfig) return;
    s.hole = getHoleFromConfig(frameConfig, frontImg, w, h);
  }, [config.frames, getContainerSize]);

  // Load image into a frame slot
  const loadIntoSlot = useCallback(async (slotIndex: number, frameIndex: number) => {
    const s = stateRef.current;
    const frameConfig = config.frames[frameIndex % config.frames.length];
    if (!frameConfig) return;
    try {
      const img = await loadImage(getAssetPath(frameConfig.src));
      s.images[slotIndex] = img;

      // Set as background on the appropriate frame div
      const div = slotIndex === 0 ? frameARef.current : frameBRef.current;
      if (div) {
        div.style.backgroundImage = `url(${img.src})`;
        div.style.backgroundSize = 'cover';
        div.style.backgroundPosition = 'center';
      }
    } catch (e) {
      console.warn(`[Foreman] Failed to load frame ${frameIndex}:`, e);
    }
  }, [config.frames]);

  // Swap frames
  const swapFrames = useCallback(() => {
    const s = stateRef.current;
    s.isFrameAFront = !s.isFrameAFront;
    s.camera = resetCamera(s.camera);

    // Update z-index
    if (frameARef.current && frameBRef.current) {
      if (s.isFrameAFront) {
        frameARef.current.style.zIndex = '2';
        frameBRef.current.style.zIndex = '1';
      } else {
        frameARef.current.style.zIndex = '1';
        frameBRef.current.style.zIndex = '2';
      }
    }

    // Advance frame index
    s.frameIndex = (s.frameIndex + 1) % config.frames.length;

    // Reset the transform on the now-front frame immediately
    const frontDiv = s.isFrameAFront ? frameARef.current : frameBRef.current;
    if (frontDiv) {
      frontDiv.style.transform = 'translate(0px, 0px) scale(1)';
      frontDiv.style.transformOrigin = '0px 0px';
    }

    // Load next image into the now-back frame
    const backSlot = s.isFrameAFront ? 1 : 0;
    const nextFrameIndex = (s.frameIndex + 1) % config.frames.length;
    loadIntoSlot(backSlot, nextFrameIndex);

    // Re-detect hole on the new front frame
    detectHole();
  }, [config.frames.length, loadIntoSlot, detectHole]);

  // Animation loop
  const animate = useCallback((time: number) => {
    const s = stateRef.current;
    if (!s.running) return;

    // Delta time
    if (s.lastTime === 0) s.lastTime = time;
    const dt = Math.min((time - s.lastTime) / 1000, 0.1); // cap at 100ms
    s.lastTime = time;

    // FPS
    s.fpsFrames++;
    if (time - s.fpsLastTime > 1000) {
      s.fps = s.fpsFrames;
      s.fpsFrames = 0;
      s.fpsLastTime = time;
    }

    // Update camera if hole exists
    if (s.hole) {
      const { w, h } = getContainerSize();
      const mode: CameraMode = config.frames[s.frameIndex]?.mode || 'straight';
      s.camera = updateCamera(s.camera, s.hole, s.speed, mode, w, h, dt);

      // Apply transform to front frame
      const frontDiv = s.isFrameAFront ? frameARef.current : frameBRef.current;
      if (frontDiv) {
        const style = getTransformStyle(s.camera, s.hole);
        frontDiv.style.transformOrigin = style.transformOrigin as string;
        frontDiv.style.transform = style.transform as string;
      }

      // Check for swap
      if (shouldSwap(s.camera)) {
        swapFrames();
      }
    }

    // Update debug info periodically (every ~200ms to avoid GC pressure)
    if (Math.floor(time / 200) !== Math.floor((time - dt * 1000) / 200)) {
      setDebugInfo({
        speed: s.speed,
        frameIndex: s.frameIndex,
        hole: s.hole,
        camera: { ...s.camera },
        fps: s.fps,
        source: 'local',
        systemRunning: s.running,
        assetLoaded: [!!s.images[0], !!s.images[1]],
      });
    }

    requestAnimationFrame(animate);
  }, [config.frames, getContainerSize, swapFrames]);

  // Initialize
  useEffect(() => {
    const s = stateRef.current;
    s.running = true;
    s.speed = config.speed || SPEED_DEFAULT;

    // Set initial z-index
    if (frameARef.current) frameARef.current.style.zIndex = '2';
    if (frameBRef.current) frameBRef.current.style.zIndex = '1';

    // Load first two frames
    const init = async () => {
      await loadIntoSlot(0, 0); // Frame A = first image
      if (config.frames.length > 1) {
        await loadIntoSlot(1, 1); // Frame B = second image
      }
      detectHole();

      setDebugInfo(prev => ({
        ...prev,
        systemRunning: true,
        assetLoaded: [!!s.images[0], !!s.images[1]],
      }));

      requestAnimationFrame(animate);
    };

    init();

    return () => {
      s.running = false;
    };
  }, [config, loadIntoSlot, detectHole, animate]);

  const handleSpeedChange = useCallback((newSpeed: number) => {
    stateRef.current.speed = newSpeed;
    setDebugInfo(prev => ({ ...prev, speed: newSpeed }));
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        inset: 0,
        overflow: 'hidden',
        background: '#000',
      }}
    >
      {/* Frame A */}
      <div
        ref={frameARef}
        style={{
          position: 'absolute',
          inset: 0,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* Frame B */}
      <div
        ref={frameBRef}
        style={{
          position: 'absolute',
          inset: 0,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* Hole debug overlay */}
      <HoleOverlay hole={debugInfo.hole} visible={debugVisible} />

      {/* Debug panel */}
      <DebugPanel
        debug={debugInfo}
        visible={debugVisible}
        onToggle={() => setDebugVisible(v => !v)}
        onSpeedChange={handleSpeedChange}
      />
    </div>
  );
};

export default RelayPlayer;
