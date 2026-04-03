import React from 'react';
import { DebugInfo, HoleData } from './types';
import { SPEED_MIN, SPEED_MAX } from './cameraman';

interface DebugPanelProps {
  debug: DebugInfo;
  visible: boolean;
  onToggle: () => void;
  onSpeedChange: (speed: number) => void;
}

const DebugPanel: React.FC<DebugPanelProps> = ({ debug, visible, onToggle, onSpeedChange }) => {
  return (
    <>
      {/* Toggle button — always visible */}
      <button
        onClick={onToggle}
        style={{
          position: 'fixed',
          top: 8,
          right: 8,
          zIndex: 10000,
          background: 'rgba(0,0,0,0.7)',
          color: '#0f0',
          border: '1px solid #0f0',
          borderRadius: 4,
          padding: '4px 10px',
          fontFamily: 'monospace',
          fontSize: 12,
          cursor: 'pointer',
        }}
      >
        {visible ? 'HIDE DEBUG' : 'DEBUG'}
      </button>

      {/* System running dot — always visible */}
      <div
        style={{
          position: 'fixed',
          top: 12,
          left: 12,
          zIndex: 10000,
          width: 10,
          height: 10,
          borderRadius: '50%',
          background: debug.systemRunning ? '#0f0' : '#f00',
          boxShadow: debug.systemRunning ? '0 0 6px #0f0' : '0 0 6px #f00',
        }}
      />

      {visible && (
        <div
          style={{
            position: 'fixed',
            top: 36,
            right: 8,
            zIndex: 10000,
            background: 'rgba(0,0,0,0.85)',
            color: '#0f0',
            fontFamily: 'monospace',
            fontSize: 11,
            padding: 12,
            borderRadius: 6,
            border: '1px solid #0f0',
            minWidth: 220,
            lineHeight: 1.6,
          }}
        >
          <div>FPS: {debug.fps}</div>
          <div>SPEED: {debug.speed.toFixed(4)}</div>
          <div>
            <input
              type="range"
              min={SPEED_MIN}
              max={SPEED_MAX}
              step={0.001}
              value={debug.speed}
              onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: '#0f0' }}
            />
          </div>
          <div>FRAME: {debug.frameIndex}</div>
          <div>SOURCE: {debug.source}</div>
          <div>ASSETS: [{debug.assetLoaded[0] ? '✓' : '✗'}, {debug.assetLoaded[1] ? '✓' : '✗'}]</div>
          <div>CAMERA: x={debug.camera.x.toFixed(1)} y={debug.camera.y.toFixed(1)} s={debug.camera.scale.toFixed(2)}</div>
          {debug.hole && (
            <>
              <div>HOLE: {debug.hole.width.toFixed(0)}×{debug.hole.height.toFixed(0)}</div>
              <div>HOLE CENTER: {debug.hole.centerX.toFixed(0)},{debug.hole.centerY.toFixed(0)}</div>
            </>
          )}
          {!debug.hole && <div>HOLE: none detected</div>}
        </div>
      )}
    </>
  );
};

export default DebugPanel;

/** Debug overlay: crosshair + bounding box on the hole */
export const HoleOverlay: React.FC<{ hole: HoleData | null; visible: boolean }> = ({ hole, visible }) => {
  if (!visible || !hole) return null;
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 9999 }}>
      {/* Bounding box */}
      <div
        style={{
          position: 'absolute',
          left: hole.x,
          top: hole.y,
          width: hole.width,
          height: hole.height,
          border: '2px dashed #0ff',
          boxSizing: 'border-box',
        }}
      />
      {/* Crosshair */}
      <div
        style={{
          position: 'absolute',
          left: hole.centerX - 10,
          top: hole.centerY,
          width: 20,
          height: 2,
          background: '#f00',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: hole.centerX,
          top: hole.centerY - 10,
          width: 2,
          height: 20,
          background: '#f00',
        }}
      />
    </div>
  );
};
