---
name: game-ai
cluster: game-dev
description: "Develops AI algorithms for games, including pathfinding, decision trees, and machine learning integration."
tags: ["game-ai","artificial-intelligence","pathfinding"]
dependencies: []
composes: []
similar_to: []
called_by: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "game ai pathfinding decision trees machine learning"
---

# game-ai

## Purpose
This skill develops AI algorithms for games, focusing on pathfinding (e.g., A* algorithm), decision trees for NPC behaviors, and machine learning integration (e.g., using TensorFlow for training models). It helps automate AI logic in game development workflows.

## When to Use
- When implementing NPC navigation in games, such as finding optimal paths in a grid-based world.
- For creating decision-making systems, like enemy AI choosing actions based on game states.
- Integrating ML for adaptive AI, such as training models to predict player moves in real-time simulations.

## Key Capabilities
- Pathfinding: Implements A* algorithm with configurable heuristics; supports grid-based maps up to 100x100 cells.
- Decision Trees: Builds trees from JSON config files, e.g., {"node": "if health < 50 then flee"}; evaluates in under 10ms per decision.
- Machine Learning Integration: Wraps TensorFlow APIs for model training; uses endpoints like `/api/ml/train` with input vectors for reinforcement learning in games.
- Optimization: Includes flags for performance tuning, such as `--optimize-memory` to reduce heap usage by 20% in pathfinding routines.

## Usage Patterns
To use this skill, invoke it via OpenClaw's CLI or API, passing required parameters. Always set the environment variable `$GAME_AI_API_KEY` for authentication. For pathfinding, call a function with a start/end point and grid; for decision trees, load a config and evaluate inputs. Structure code to handle asynchronous responses, e.g., wrap API calls in try-catch blocks.

## Common Commands/API
- CLI Command: `openclaw game-ai pathfind --start 0,0 --end 10,10 --grid '{"width":20,"height":20,"obstacles":[[5,5]]}'`
  - Code Snippet:
    ```
    import openclaw
    result = openclaw.run('game-ai pathfind', {'start': '0,0', 'end': '10,10'})
    print(result['path'])  # Outputs: [[0,0], [1,0], ...]
    ```
- API Endpoint: POST to `/api/game-ai/decision-tree` with JSON body {"tree": {"root": "if enemy_near then attack"}, "input": {"enemy_near": true}}
  - Code Snippet:
    ```
    import requests
    headers = {'Authorization': f'Bearer {os.environ["GAME_AI_API_KEY"]}'}
    response = requests.post('https://api.openclaw.com/api/game-ai/decision-tree', json={'tree': {...}}, headers=headers)
    print(response.json()['decision'])  # e.g., 'attack'
    ```
- Config Format: Use JSON for inputs, e.g., {"algorithm": "A*", "params": {"heuristic": "manhattan"}}; validate with `--validate-config` flag to check for errors before execution.

## Integration Notes
Integrate by importing the OpenClaw SDK and initializing with `$GAME_AI_API_KEY`. For game engines, add as a module in Unity (via C# scripts) or Unreal (via Blueprints). Ensure compatibility by matching versions, e.g., use OpenClaw SDK v2.5+. For ML, link to external libraries like TensorFlow by adding `pip install tensorflow` and configuring via env vars, e.g., `$TF_MODEL_PATH=/path/to/model.h5`. Test integrations in a sandbox environment to avoid game loop interruptions.

## Error Handling
Always check for API errors by inspecting response codes (e.g., 401 for unauthorized, handled via retry with `$GAME_AI_API_KEY`). For invalid inputs, use CLI flag `--debug` to log details, e.g., `openclaw game-ai pathfind --start invalid --debug`. In code, catch exceptions like ValueError for malformed grids:
  - Code Snippet:
    ```
    try:
        path = openclaw.run('game-ai pathfind', params)
    except ValueError as e:
        print(f"Error: {e} - Fix grid format and retry")
    ```
Validate configs before use, e.g., with a pre-check function, and implement retries for network failures up to 3 attempts with exponential backoff.

## Concrete Usage Examples
1. Pathfinding in a 2D Game: To find a path for an NPC around obstacles, run `openclaw game-ai pathfind --start 1,1 --end 5,5 --grid '{"width":10,"obstacles":[[3,3]]}'`. This returns a list of coordinates; integrate into your game loop by updating the NPC's position based on the path array.
2. Decision Tree for Enemy AI: Build a tree with `openclaw game-ai build-tree --config '{"root": "if player_health < 20 then heal"}'`, then evaluate in-game: Use the API to check decisions, e.g., POST to `/api/game-ai/decision-tree` with current game state, and trigger actions like healing if the response is "heal".

## Graph Relationships
- Related Clusters: game-dev (direct parent for game-related skills).
- Related Tags: artificial-intelligence (shares ML components), pathfinding (core functionality overlap).
- Connections: Links to skills like "game-engine" for integration, and "ml-tools" for advanced training; forms a subgraph with "game-ai" as a central node for AI in gaming ecosystems.
