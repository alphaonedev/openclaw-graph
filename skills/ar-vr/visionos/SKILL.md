---
name: visionos
cluster: ar-vr
description: "Operating system for Apple\'s Vision Pro headset, powering spatial computing and immersive AR/VR environments."
tags: ["ar-vr","spatial-computing","apple-visionos"]
dependencies: []
composes: []
similar_to: []
called_by: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "visionos ar vr spatial computing apple headset"
---

## visionos

### Purpose
This skill enables the AI to interact with visionOS, Apple's operating system for the Vision Pro headset, allowing programmatic control of spatial computing features, AR/VR app development, and device management for immersive environments.

### When to Use
Use this skill for tasks involving AR/VR app prototyping, spatial data processing, or Vision Pro device configuration. Apply it when integrating with Apple ecosystems, handling 3D spatial interactions, or automating headset settings in development workflows. Avoid it for non-Apple platforms or basic 2D computing.

### Key Capabilities
- Access spatial computing APIs for rendering 3D environments, including RealityKit for AR scenes and ARKit integration.
- Manage Vision Pro devices via CLI for app installation, updates, and diagnostics.
- Handle immersive experiences with features like hand tracking and eye tracking through Core Motion and Vision APIs.
- Process spatial audio and video using AVFoundation extensions specific to visionOS.
- Query system states, such as battery or connectivity, via system services endpoints.

### Usage Patterns
Always initialize with authentication using `$VISIONOS_API_KEY`. For app development, pattern: Authenticate > Fetch device info > Build and deploy AR app. For device management: Authenticate > List devices > Execute command. Example 1: To create a simple AR object, use the RealityKit API to add a 3D entity. Example 2: For device setup, script a command to enable spatial audio and test it in a session.

### Common Commands/API
Use the visionOS CLI for device interactions; for APIs, leverage Swift-based calls via Xcode or HTTP endpoints. Always prefix CLI with `visionos` and include auth via env var.

- CLI Command: List devices  
  `visionos device list --format json --key $VISIONOS_API_KEY`  
  This fetches a JSON array of connected Vision Pro devices; pipe output to jq for parsing.

- API Endpoint: Get spatial environment  
  Swift snippet:  
  ```
  import RealityKit
  let anchor = AnchorEntity(world: .reality)
  arView.scene.anchors.append(anchor)
  ```
  Send a GET request to `https://api.visionos.apple.com/spatial/environments` with header `Authorization: Bearer $VISIONOS_API_KEY`.

- CLI Command: Install app  
  `visionos app install --bundle com.example.arapp --device UDID123 --force`  
  This installs a specified app bundle on the targeted device; use `--force` to overwrite existing versions.

- API Endpoint: Handle user input  
  Swift snippet:  
  ```
  let session = ARSession()
  session.delegate = self
  session.run(ARWorldTrackingConfiguration())
  ```
  Call `POST /api/visionos/input/track` with payload `{ "type": "hand" }` to start tracking gestures, authenticated via `$VISIONOS_API_KEY`.

### Integration Notes
Integrate visionOS with other Apple services by setting `$VISIONOS_API_KEY` in your environment. For cross-platform use, wrap APIs in a Swift package and call via bridging headers. Config format: Use JSON for API requests, e.g., `{ "apiKey": "$VISIONOS_API_KEY", "deviceId": "UDID123" }`. When combining with other skills, ensure AR/VR data formats match (e.g., convert spatial coordinates to standard GLTF). Test integrations in Xcode simulators first, then deploy to physical devices. For web hooks, subscribe to `https://api.visionos.apple.com/hooks/session-end` using the env var for auth.

### Error Handling
Check for common errors like authentication failures (HTTP 401) by verifying `$VISIONOS_API_KEY` is set and not expired. For API calls, handle network errors with try-catch in Swift:  
```
do {
    try await apiCall(endpoint: "/spatial/environments")
} catch let error as NetworkError {
    print("Error: \(error.localizedDescription)")
}
```  
If a CLI command fails (e.g., `visionos device list` returns "Device not found"), parse stderr and retry with corrected flags, like adding `--retry 3`. For spatial computing issues, debug with `visionos debug log --level error` to capture ARKit errors, then resolve by checking device permissions or updating firmware.

### Graph Relationships
- Related to cluster: ar-vr (e.g., shares capabilities with skills like oculus or htc-vive).
- Connected via tags: ar-vr (direct link), spatial-computing (overlaps with unity-ar), apple-visionos (specific to Apple ecosystem, links to ios or macos skills).
- Embedding hint relationships: visionos links to ar-vr and spatial-computing for broader AR queries, and apple-headset for device-specific integrations.
