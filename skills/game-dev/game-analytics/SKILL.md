---
name: game-analytics
cluster: game-dev
description: "Analyzes game data metrics for player behavior tracking and performance optimization."
tags: ["game-analytics","data-metrics","player-tracking"]
dependencies: []
composes: []
similar_to: []
called_by: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "game analytics data metrics player behavior tracking optimization"
---

## Purpose
This skill analyzes game data metrics to track player behavior and optimize performance, processing logs, sessions, and metrics from games.

## When to Use
Use this skill for processing in-game data during development, such as identifying player drop-off in levels, optimizing resource usage, or debugging performance bottlenecks in real-time multiplayer games.

## Key Capabilities
- Parse JSON-formatted game logs to extract metrics like session duration and player actions (e.g., via `claw game-analytics parse --input logs.json`).
- Generate reports for behavior tracking, such as heatmaps of player movement using API endpoint `GET /api/analytics/reports/heatmap?gameId=123`.
- Perform optimization queries, like querying for high-latency events with SQL-like filters (e.g., config in YAML: `metrics: [latency > 500ms]`).
- Integrate with ML models for predictive analytics, e.g., predict churn based on play patterns using embedded functions like `claw game-analytics predict --model churn.json`.

## Usage Patterns
Always initialize with authentication via environment variable `$GAME_ANALYTICS_API_KEY`. For CLI, run commands in a project directory with game data files. In code, import as a module and call functions directly. Use asynchronous patterns for large datasets to avoid blocking. For example, chain commands: first parse data, then analyze. Handle outputs as JSON streams for piping to other tools.

## Common Commands/API
- CLI Command: `claw game-analytics analyze --file data.json --metric player-session --output report.csv` (parses file, filters by metric, saves to CSV; requires $GAME_ANALYTICS_API_KEY).
- API Endpoint: `POST /api/analytics/track` with body `{ "event": "player_login", "data": { "sessionId": "abc123", "timestamp": "2023-10-01T12:00:00Z" } }` (sends tracking data; authenticate with Bearer token from $GAME_ANALYTICS_API_KEY).
- Code Snippet (Python):  
  ```python
  import claw
  api_key = os.environ.get('GAME_ANALYTICS_API_KEY')
  response = claw.analytics.track(event='level_complete', data={'level': 5}, api_key=api_key)
  print(response.json())
  ```
- Config Format: YAML file for custom metrics, e.g.,  
  ```
  metrics:
    - name: session_length
      threshold: 300  # seconds
    filters:
      - player_type: 'new'
  ```
  Load with `claw game-analytics load-config config.yaml`.

## Integration Notes
Integrate by setting $GAME_ANALYTICS_API_KEY in your environment before running commands. For web apps, use OAuth via `claw game-analytics auth --provider google` to get a token. In Node.js projects, require the module and handle promises:  
```javascript
const claw = require('claw');
claw.analytics.setKey(process.env.GAME_ANALYTICS_API_KEY);
claw.analytics.analyze({ file: 'data.json' }).then(data => console.log(data));
```  
Ensure data formats match (e.g., JSON inputs only). For cluster integration, link with 'game-dev' tools by prefixing commands, like `claw game-dev game-analytics analyze`.

## Error Handling
Check for errors by inspecting exit codes in CLI (e.g., code 401 means auth failure; retry with `claw game-analytics retry --command analyze`). In API calls, catch HTTP errors: if status 403, log "Invalid API key" and prompt for $GAME_ANALYTICS_API_KEY reset. Use try-except in code snippets:  
```python
try:
    result = claw.analytics.analyze(file='data.json')
except claw.AnalyticsError as e:
    if e.code == 'AUTH_FAILED':
        print("Set GAME_ANALYTICS_API_KEY and retry")
```  
Always validate inputs before processing to avoid parsing errors (e.g., ensure JSON is well-formed).

## Concrete Usage Examples
1. To track player behavior in a mobile game: First, export logs to JSON, then run `claw game-analytics analyze --file player_logs.json --metric drop-off` to identify levels with high quit rates. Use the output to adjust game design, e.g., via API: `POST /api/analytics/optimize` with { "suggestions": true }.
2. For performance optimization in a multiplayer server: Load config with `claw game-analytics load-config perf.yaml`, then execute `claw game-analytics query --metric latency --filter 'server=prod'` to get reports. Integrate into a CI/CD pipeline to automate checks, using code:  
   ```javascript
   claw.analytics.query({ metric: 'latency' }).then(results => {
       if (results.avg > 100) console.log('Optimize server');
   });
   ```

## Graph Relationships
- Related to: game-dev cluster (parent), player-tracking skill (dependency), data-metrics skill (sibling).
- Connects with: game-logging for input data, performance-optimization for action outputs.
