
# Relay Player — 2-Frame Camera Navigation System

## Overview
A fullscreen canvas-based player that creates the illusion of flying through holes in images by moving a virtual camera toward transparent regions, then seamlessly swapping frames.

## Architecture
- **Survey Guy** — Scans Frame A's image data (canvas pixel analysis) to find the bounding box of the transparent (alpha) region. Outputs hole coordinates. Also supports JSON config overrides per image.
- **Cameraman** — Animates `transformOrigin` and `scale` toward the hole center. Single `speed` variable controls all motion (range 0.002–0.03, default 0.01).
- **Foreman** — Preloads the next image into the inactive frame (B). Handles cleanup after swap.
- **Two Frame layers** — Simple `<div>` elements with background images. No logic, no animation responsibility.

## Build Steps (in strict order per spec)

### Step 1: Render Test
- Fullscreen container with a colored dot confirming the system is running
- Debug overlay showing system status

### Step 2: Load One Image
- Asset loader that accepts uploaded PNGs (local files via `/public/relay-assets/`)
- Display a single image filling the screen
- Debug border showing asset loaded

### Step 3: Two Frames (No Motion)
- Frame A (front) and Frame B (back) layered via CSS `z-index`
- Both display different images simultaneously
- No animation yet

### Step 4: Manual Swap
- Click triggers instant swap (A↔B roles switch)
- Foreman loads next image into the now-inactive frame

### Step 5: Hole Detection
- Survey Guy scans Frame A's canvas pixels for alpha transparency
- Outputs `{ x, y, width, height, centerX, centerY }`
- Falls back to JSON config coordinates if provided
- Debug crosshair + bounding box overlay on detected hole

### Step 6: Hole-Targeted Zoom
- Cameraman sets `transformOrigin` to hole center (never screen center)
- Animates scale toward hole using speed variable
- When Frame B fills viewport → trigger swap → reset camera (invisible reset)

### Step 7: Auto-Play Loop
- Full main loop: load → detect → animate → swap → repeat
- Speed slider in debug panel (0.002–0.03)
- Ordered image array, loops back to start

### Step 8: Camera Modes
- Support `straight`, `angled`, and `donut` path modes per frame
- Path varies, target (hole center) does not

### Step 9: Debug Panel
- Toggleable overlay showing: speed, source, current frame index, hole bounds, camera position/scale, FPS

## Config Format
```json
{
  "frames": [
    { "src": "f_0001.png", "mode": "straight" },
    { "src": "f_0002.png", "mode": "angled", "hole": { "x": 100, "y": 200, "width": 300, "height": 250 } }
  ],
  "speed": 0.01
}
```

## Key Rules Enforced
- Only 2 frames ever exist in DOM
- `transformOrigin` always uses hole center, never screen center
- Frame B stays rectangular, never clipped to hole shape
- Swap only when B visually fills the screen
- Camera reset must be invisible (no flicker)
- All systems visible in debug mode
