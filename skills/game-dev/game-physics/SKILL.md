---
name: game-physics
cluster: game-dev
description: "Handles physics simulations in games, including collision detection, rigid body dynamics, and force applications."
tags: ["physics","game-engine","simulation"]
dependencies: []
composes: []
similar_to: []
called_by: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "game physics simulation collision dynamics rigid body"
---

# game-physics

## Purpose
This skill handles physics simulations for games, focusing on core mechanics like collision detection, rigid body dynamics, and force applications. It integrates with game engines to simulate realistic interactions, ensuring accurate physics behavior in 2D/3D environments.

## When to Use
Use this skill when developing games that require physics, such as platformers, simulations, or multiplayer worlds. Apply it for scenarios involving object interactions (e.g., ball bouncing, character movement), performance-critical simulations, or when extending existing game engines like Unity or Godot. Avoid it for non-game applications or simple animations.

## Key Capabilities
- Collision detection: Supports AABB, OBB, and sphere-based checks; uses algorithms like SAT for precise intersections.
- Rigid body dynamics: Simulates velocity, acceleration, and torque; integrates with Newton's laws for force applications.
- Force handling: Applies impulses, gravity, and friction; configurable via vector inputs (e.g., [x, y, z] forces).
- Simulation control: Pauses, steps, or resets simulations; handles time scaling for slow-motion effects.
- Optimization: Uses spatial partitioning (e.g., quadtrees) to reduce computation in large scenes.

## Usage Patterns
Invoke this skill via OpenClaw's CLI or API for modular integration. Start by loading a scene configuration, then run simulations in a loop. For CLI, pipe inputs from files; for API, use JSON payloads. Always set up authentication with `$OPENCLAW_API_KEY` in your environment. Example pattern: Load config → Initialize simulation → Update loop → Output results.

## Common Commands/API
Use the following CLI commands or API endpoints for interactions. All commands require authentication via `$OPENCLAW_API_KEY`.

- CLI Command: `openclaw game-physics simulate --file scene.json --steps 100 --gravity 9.8`
  - Flags: `--file` for JSON config (e.g., {"objects": [{"mass": 1.0, "position": [0,0,0]}]}), `--steps` for simulation iterations, `--gravity` for vector [x,y,z].
  - Example: Run with `export OPENCLAW_API_KEY=your_key; openclaw game-physics simulate --file input.json`.

- API Endpoint: POST /api/game-physics/simulate
  - Payload: JSON like {"scene": {"objects": [{"id": "ball", "mass": 2.0, "velocity": [1,0,0]}]}, "steps": 50}
  - Headers: Include `Authorization: Bearer $OPENCLAW_API_KEY`
  - Response: JSON with results, e.g., {"positions": [{"id": "ball", "newPosition": [5,0,0]}]}

- Code Snippet (Python CLI wrapper):
  ```
  import os
  import subprocess
  api_key = os.environ.get('OPENCLAW_API_KEY')
  subprocess.run(['openclaw', 'game-physics', 'simulate', '--file', 'scene.json', '--steps', '10'])
  ```

- Code Snippet (API call with requests):
  ```
  import requests
  headers = {'Authorization': f'Bearer {os.environ.get("OPENCLAW_API_KEY")}'}
  data = {'scene': {'objects': [{'mass': 1.0, 'position': [0,0,0]}]}, 'steps': 20}
  response = requests.post('https://api.openclaw.ai/api/game-physics/simulate', json=data, headers=headers)
  ```

Config formats: Use JSON for scenes, e.g., {"objects": [{"id": "obj1", "shape": "sphere", "radius": 1.0, "mass": 5.0, "position": [0,0,0]}]}. Validate with schema: objects must have "id", "shape", and physics properties.

## Integration Notes
Integrate by wrapping the skill in your game loop: Call simulate after user inputs or at fixed intervals. For game engines, export results as vectors for rendering. Use hooks for custom callbacks, e.g., via `--callback-url` in CLI. If using with other OpenClaw skills, chain outputs (e.g., pass simulation results to a rendering skill). Ensure compatibility by matching data formats; physics outputs are in standard arrays [x,y,z]. For async operations, use API with webhooks.

## Error Handling
Common errors include invalid configs (e.g., missing "mass" field), authentication failures, or simulation overflows. Handle with:
- Check `$OPENCLAW_API_KEY` before commands; error if unset.
- Validate JSON schemas using a library like jsonschema; example: If response status is 400, parse error message like "Missing field: mass".
- Code Snippet (Error handling in Python):
  ```
  try:
      result = subprocess.run(['openclaw', 'game-physics', 'simulate', '--file', 'invalid.json'], check=True)
  except subprocess.CalledProcessError as e:
      print(f"Error: {e.returncode} - {e.stderr.decode()}")
  ```
- For API: Catch HTTP errors (e.g., 401 for auth issues) and retry with exponential backoff. Log detailed errors with `--debug` flag in CLI.

## Concrete Usage Examples
1. **Simulate a bouncing ball:** Use for a simple physics demo. Command: `openclaw game-physics simulate --file ball.json --steps 50 --gravity [0,-9.8,0]`. In code: Load "ball.json" with {"objects": [{"id": "ball", "shape": "sphere", "position": [0,10,0], "velocity": [5,0,0], "bounciness": 0.8}]}, then apply to update game positions every frame.
   
2. **Collision detection in a game level:** For a platformer, detect hits. API call: POST /api/game-physics/simulate with {"scene": {"objects": [{"id": "player", "position": [1,2,0]}, {"id": "wall", "shape": "box", "position": [0,0,0]}]}, "steps": 1}. Process response to check for collisions and adjust player movement accordingly.

## Graph Relationships
- Related to cluster: game-dev (e.g., shares data with rendering or AI skills).
- Connected skills: rendering (outputs positions for visualization), pathfinding (uses physics for dynamic environments).
- Dependencies: Requires core OpenClaw services for authentication; no direct edges to non-game clusters.
