---
name: openclaw-admin
cluster: core-openclaw
description: "OpenClaw gateway management: start/stop/restart/update, config patches, compaction tuning, agent management"
tags: ["openclaw","admin","gateway","config"]
dependencies: []
composes: []
similar_to: []
called_by: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "openclaw gateway restart update config compaction agent"
---

# openclaw-admin

## Purpose
This skill handles administration of the OpenClaw gateway, enabling tasks like starting, stopping, restarting, updating the gateway, applying configuration patches, tuning compaction settings, and managing agents within the core-openclaw cluster.

## When to Use
Use this skill for gateway maintenance, such as during deployments (e.g., applying updates), troubleshooting (e.g., restarting after errors), or configuration adjustments (e.g., tuning compaction for performance). Apply it in production environments where the core-openclaw cluster is active, or for agent lifecycle management in distributed setups.

## Key Capabilities
- Gateway lifecycle: Start, stop, restart, or update using CLI commands like `openclaw gateway start --cluster core-openclaw --force`.
- Configuration patches: Apply JSON Patch documents, e.g., {"op": "replace", "path": "/settings/compaction", "value": {"interval": 60}}.
- Compaction tuning: Adjust settings via flags, such as `openclaw compaction tune --threshold 80 --interval 300` to set memory thresholds and intervals.
- Agent management: Add, remove, or list agents with commands like `openclaw agent add --name agent1 --cluster core-openclaw`.
- Authentication: Requires `$OPENCLAW_API_KEY` environment variable for all operations.

## Usage Patterns
Always set `$OPENCLAW_API_KEY` before running commands, e.g., `export OPENCLAW_API_KEY=your_api_key`. For CLI, prefix with `openclaw` and specify the `--cluster core-openclaw` flag. Use API endpoints with HTTP requests, including the `Authorization: Bearer $OPENCLAW_API_KEY` header. In scripts, wrap calls in error checks, e.g., verify the cluster exists before patching configs. For automation, integrate with tools like cron jobs or CI/CD pipelines by calling CLI from bash scripts.

## Common Commands/API
- Start gateway: CLI: `openclaw gateway start --cluster core-openclaw --env prod`. API: POST /api/gateway/start with body {"cluster": "core-openclaw", "env": "prod"}.
- Stop gateway: CLI: `openclaw gateway stop --cluster core-openclaw --force`. API: POST /api/gateway/stop with body {"cluster": "core-openclaw"}.
- Restart gateway: CLI: `openclaw gateway restart --cluster core-openclaw`. API: POST /api/gateway/restart with body {"cluster": "core-openclaw"}.
- Update gateway: CLI: `openclaw gateway update --cluster core-openclaw --version 2.1.0`. API: POST /api/gateway/update with body {"cluster": "core-openclaw", "version": "2.1.0"}.
- Apply config patch: CLI: `openclaw config patch --file config.patch.json --cluster core-openclaw`. API: PATCH /api/config with body from a JSON file, e.g., {"op": "add", "path": "/agents", "value": ["agent1"]}.
- Tune compaction: CLI: `openclaw compaction tune --cluster core-openclaw --threshold 75 --interval 600`. API: PUT /api/compaction with body {"threshold": 75, "interval": 600}.
- Manage agents: CLI: `openclaw agent add --name agent2 --cluster core-openclaw`. API: POST /api/agents with body {"name": "agent2", "cluster": "core-openclaw"}.
- Code snippet for API call (restart gateway):
  ```bash
  export OPENCLAW_API_KEY=your_key
  curl -X POST https://api.openclaw.com/api/gateway/restart \
  -H "Authorization: Bearer $OPENCLAW_API_KEY" \
  -d '{"cluster": "core-openclaw"}'
  ```
- Code snippet for config patch:
  ```json
  {"op": "replace", "path": "/settings/logLevel", "value": "debug"}
  ```

## Integration Notes
Integrate this skill by importing it into AI workflows via the "openclaw-admin" ID. Use the embedding hint "openclaw gateway restart update config compaction agent" for vector-based searches in knowledge graphs. For external systems, ensure compatibility with core-openclaw cluster endpoints (e.g., via HTTPS). When combining with other skills, pass outputs as inputs, like using agent IDs from this skill in monitoring tools. Set `$OPENCLAW_API_KEY` in environment files for secure access, and handle cluster-specific configs by appending `--cluster core-openclaw` to all commands.

## Error Handling
Check for authentication errors (e.g., HTTP 401) by verifying `$OPENCLAW_API_KEY` is set and valid; use `echo $OPENCLAW_API_KEY` in scripts. For gateway not found (HTTP 404), confirm cluster status with `openclaw gateway status --cluster core-openclaw`. Parse CLI errors from stderr, e.g., "Error: Cluster core-openclaw not reachable" indicates network issues—retry with exponential backoff. For config patches, handle invalid JSON with try-catch in scripts, e.g., in bash: `openclaw config patch --file invalid.json || echo "Invalid JSON format"`. Common API errors: 400 for bad requests (check body format), 500 for server issues (log and alert).

## Concrete Usage Examples
1. Restart the gateway after a configuration change: First, export the key: `export OPENCLAW_API_KEY=your_api_key`. Then, apply a patch: `openclaw config patch --file patch.json --cluster core-openclaw`, where patch.json contains {"op": "replace", "path": "/settings/restartTrigger", "value": true}. Finally, restart: `openclaw gateway restart --cluster core-openclaw`.
2. Tune compaction and add an agent for performance optimization: Start by tuning: `openclaw compaction tune --cluster core-openclaw --threshold 85 --interval 900`. Then, add an agent: `openclaw agent add --name monitoring-agent --cluster core-openclaw`. Verify with: `openclaw agent list --cluster core-openclaw` to ensure the agent is active.

## Graph Relationships
- Depends on: core-openclaw (cluster for all operations)
- Related to: openclaw (main ecosystem), admin (role-based access), gateway (primary resource), config (configuration management)
- Tagged with: openclaw, admin, gateway, config (for search and linking)
