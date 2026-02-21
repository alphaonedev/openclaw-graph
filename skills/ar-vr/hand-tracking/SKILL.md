---
name: hand-tracking
cluster: ar-vr
description: "Enables real-time detection and tracking of hand gestures using computer vision in AR/VR environments."
tags: ["hand-tracking","ar-vr","gesture-detection"]
dependencies: []
composes: []
similar_to: []
called_by: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "hand tracking ar vr gesture recognition computer vision"
---

## hand-tracking

### Purpose
This skill enables real-time detection and tracking of hand gestures in AR/VR environments using computer vision algorithms, allowing for seamless integration into applications like virtual interactions or gesture-based controls.

### When to Use
Use this skill when building AR/VR apps that require hand gesture input, such as gesture-controlled interfaces in gaming, remote collaboration tools, or accessibility features in virtual reality headsets. Apply it in scenarios with live camera feeds where low-latency tracking is essential, like real-time object manipulation.

### Key Capabilities
- Real-time hand pose estimation with up to 21 key points per hand using pre-trained models like MediaPipe Hands.
- Gesture recognition for common actions (e.g., pinch, wave, swipe) with configurable thresholds for accuracy.
- Support for multiple input sources, including webcam streams or AR/VR device cameras, with frame rates up to 60 FPS.
- Output formats including JSON for hand landmarks and event triggers for detected gestures.
- Customizable models via config files, such as specifying minimum confidence levels (e.g., 0.5 for detection).

### Usage Patterns
Always initialize the skill with an input source and authentication. Start by setting the environment variable for API access, e.g., `export OPENCLAW_API_KEY=your_api_key`. For CLI usage, pipe input from a camera device. In code, import the skill as a module and call tracking functions in a loop. Handle asynchronous operations to avoid blocking the main thread. For AR/VR integration, combine with rendering loops to update virtual objects based on hand positions.

### Common Commands/API
Use the CLI tool for quick prototyping or the REST API for programmatic access. Authentication requires the `$OPENCLAW_API_KEY` environment variable.

- **CLI Commands**:
  - Run tracking: `claw hand-track --input /dev/video0 --model mediapipe --confidence 0.7`
    - Flags: `--input` specifies the camera device (e.g., `/dev/video0`), `--model` selects the tracking model (e.g., `mediapipe` or `custom`), `--confidence` sets the detection threshold.
  - Save output: `claw hand-track --input file.mp4 --output results.json --gestures pinch,wave`
    - This processes a video file and outputs detected gestures to a JSON file.

- **API Endpoints**:
  - POST to `/api/hand-track`: Send a JSON payload with `{ "input": "camera", "model": "mediapipe", "confidence": 0.7 }` to start tracking.
    - Example response: `{ "hand_landmarks": [ [x1,y1,z1], ... ], "gestures": ["pinch"] }`.
  - GET `/api/hand-track/status`: Check current session status, requires header `Authorization: Bearer $OPENCLAW_API_KEY`.

- **Code Snippets**:
  - Python (using OpenClaw SDK):
    ```python
    import openclaw
    client = openclaw.Client(api_key=os.environ['OPENCLAW_API_KEY'])
    results = client.hand_track(input_source='camera', model='mediapipe')
    print(results['gestures'])
    ```
  - JavaScript (Node.js):
    ```javascript
    const openclaw = require('openclaw');
    const client = new openclaw.Client(process.env.OPENCLAW_API_KEY);
    client.handTrack({ input: 'camera', confidence: 0.7 }).then(data => console.log(data.hand_landmarks));
    ```

- **Config Formats**:
  - Use JSON for configurations: `{ "model": "mediapipe", "gestures": ["pinch", "wave"], "confidence": 0.7 }`.
  - Load via CLI: `claw hand-track --config path/to/config.json`.

### Integration Notes
Integrate by wrapping the skill in your AR/VR framework's event loop. For Unity, use the OpenClaw Unity plugin to subscribe to hand events. In web apps, pair with WebRTC for camera streams. Always validate input sources for compatibility (e.g., ensure camera resolution is at least 640x480). If using custom models, upload them via the API endpoint `/api/hand-track/models` with a multipart form. Test with mock data before production to handle varying lighting conditions.

### Error Handling
Check for common errors like invalid API keys or camera access issues. Use try-catch blocks in code snippets. For CLI, errors return exit codes (e.g., 1 for authentication failure). Specific cases:
- If `$OPENCLAW_API_KEY` is missing, the API responds with 401 Unauthorized; set it via `export OPENCLAW_API_KEY=your_key` before running.
- For input errors (e.g., unavailable camera), catch exceptions like `InputNotFoundError` and fallback to a default source.
- Handle low-confidence detections by setting a minimum threshold and logging warnings, e.g., in code: `if results['confidence'] < 0.5: raise ValueError("Low confidence detection")`.
- Retry transient errors (e.g., network issues) with exponential backoff in API calls.

### Concrete Usage Examples
1. **Example 1: Real-time Gesture Control in AR App**
   - Scenario: Build an AR app that moves a virtual object with hand gestures.
   - Steps: Export `OPENCLAW_API_KEY`, run `claw hand-track --input camera --gestures pinch`, then in Python: 
     ```python
     import openclaw
     client = openclaw.Client(os.environ['OPENCLAW_API_KEY'])
     while True: results = client.hand_track(); if 'pinch' in results['gestures']: move_object(results['hand_landmarks'])
     ```
     - This detects pinches and updates object positions in real-time.

2. **Example 2: Video Analysis for Gesture Detection**
   - Scenario: Analyze a recorded video to detect hand waves for training data.
   - Steps: Use CLI: `claw hand-track --input video/sample.mp4 --output gestures.log --gestures wave`.
   - In code: POST to `/api/hand-track` with `{ "input": "file.mp4", "gestures": ["wave"] }`, then process the response to log timestamps of detected waves.
     - Example snippet:
       ```javascript
       fetch('/api/hand-track', { method: 'POST', headers: { 'Authorization': `Bearer ${process.env.OPENCLAW_API_KEY}` }, body: JSON.stringify({ input: 'file.mp4' }) })
         .then(res => res.json()).then(data => console.log(data.gestures));
       ```

### Graph Relationships
- Relates to: ar-vr (cluster), gesture-detection (tag), camera-access (skill for input handling).
- Depends on: computer-vision (core technology), requires authentication via API key.
- Connected to: object-tracking (for extending to full-body tracking), integrates with rendering-engine (for AR/VR visualization).
