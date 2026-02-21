---
name: game-audio
cluster: game-dev
description: "Handles audio processing in game engines for real-time sound effects, music, and spatial audio."
tags: ["audio","game-dev","sound"]
dependencies: []
composes: []
similar_to: []
called_by: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "game audio sound effects music spatial engine"
---

# game-audio

## Purpose
This skill enables real-time audio processing in game engines, managing sound effects, music playback, and spatial audio for immersive experiences. It integrates with engines like Unity or Unreal to handle audio streams, effects, and positioning, ensuring low-latency performance in games.

## When to Use
- Developing games that require dynamic audio, such as responsive sound effects for player actions.
- Implementing spatial audio for VR/AR games to simulate 3D sound environments.
- Optimizing audio for performance in resource-constrained mobile games.
- When you need to mix audio layers, like background music with in-game effects, using engine-specific APIs.

## Key Capabilities
- Process real-time audio streams with effects like reverb, echo, and pitch shifting via the `processAudio` function.
- Handle spatial audio using vector-based positioning, e.g., calculating sound attenuation based on player coordinates.
- Support multiple audio formats (WAV, MP3, OGG) and dynamic volume control.
- Integrate with game loops for event-driven audio triggers, such as playing a sound on collision detection.
- Provide audio analysis tools, like frequency spectrum detection for adaptive music.

## Usage Patterns
To use this skill, first initialize it in your game engine script, then call methods for audio playback or processing. Always check for audio context availability before operations. For CLI usage, run commands from the project root directory. Pattern: Import the skill, set up authentication with `$GAME_AUDIO_API_KEY`, and use event handlers for audio events.

## Common Commands/API
- CLI Command: `claw audio play --file assets/sound.wav --volume 0.8 --loop true`
  - Flags: `--file` specifies the audio file path; `--volume` sets level (0.0-1.0); `--loop` enables looping.
- API Endpoint: POST /api/game-audio/play with JSON body: `{"file": "assets/sound.wav", "position": [0, 0, 0]}`
  - Requires header: `Authorization: Bearer $GAME_AUDIO_API_KEY`
- Code Snippet (Python):
  ```python
  import claw_audio
  claw_audio.init(key=os.environ['GAME_AUDIO_API_KEY'])
  claw_audio.play_sound('assets/sound.wav', volume=0.5)
  ```
- Code Snippet (C# for Unity):
  ```csharp
  using ClawAudio;
  void Start() {
      AudioManager.Instance.Play("assets/music.mp3", loop: true);
  }
  ```
- Config Format: JSON for audio settings, e.g., `{"effects": {"reverb": 0.3}, "spatial": true}`. Load via `claw_audio.load_config('config.json')`.

## Integration Notes
Integrate by adding the skill as a dependency in your project (e.g., via npm for Node.js or Unity package manager). Ensure audio hardware is detected using `claw_audio.check_device()`. For cross-engine compatibility, wrap calls in abstraction layers. If using with other OpenClaw skills, pass audio events via the cluster (e.g., link to "game-dev" skills). Set env var for auth: export GAME_AUDIO_API_KEY=your_key. Test integration in a sandbox environment before production.

## Error Handling
Always wrap audio calls in try-catch blocks to handle exceptions like file not found or API failures. Common errors: "Audio device unavailable" – check with `claw_audio.is_device_ready()` and retry after 2 seconds. For API errors, verify status codes (e.g., 401 for unauthorized) and log with `claw_audio.log_error(message)`. Use custom handlers: e.g., in code:
```python
try:
    claw_audio.play_sound('file.wav')
except AudioError as e:
    print(f"Error: {e}. Retrying...")
    claw_audio.retry_operation()
```
Monitor for latency issues by setting timeouts on commands, e.g., `--timeout 5000` in CLI.

## Concrete Usage Examples
1. Playing a sound effect on player jump in a Unity game:
   - Code: 
     ```csharp
     void OnJump() {
         AudioManager.Instance.Play("jump.wav", position: playerTransform.position);
     }
     ```
   - Steps: Initialize AudioManager in Start(), ensure $GAME_AUDIO_API_KEY is set, and call OnJump() on input event.
   
2. Implementing spatial audio for enemy detection in a 3D game:
   - Code:
     ```python
     def detect_enemy():
         position = [enemy_x, enemy_y, enemy_z]
         claw_audio.play_spatial('alert.mp3', position=position, radius=5.0)
     ```
   - Steps: Call detect_enemy() in the game loop, pass player position for attenuation, and adjust radius for sound fade.

## Graph Relationships
- Related to: "game-dev" cluster (e.g., skills like game-rendering for synchronized audio-visual effects).
- Connected via tags: "audio" links to skills like speech-recognition; "sound" to audio-editing tools.
- Dependencies: Requires "core-audio" for base functionality; integrates with "game-physics" for spatial calculations.
