---
name: session-mesh
cluster: distributed-comms
description: "Session topology: discover alive sessions, specialization registry, steer/kill sub-agents, session keys"
tags: ["sessions","topology","mesh","subagents"]
dependencies: []
composes: []
similar_to: []
called_by: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "session mesh topology alive steer kill sub-agent registry sessions_list"
---

# session-mesh

## Purpose
This skill manages session topologies in distributed communication systems. It enables discovery of active sessions, maintains a specialization registry, allows steering or terminating sub-agents, and handles session keys for secure interactions. Use it to build resilient mesh networks where agents communicate dynamically.

## When to Use
- When monitoring or managing distributed sessions in real-time, such as in IoT fleets or multi-agent AI systems.
- For tasks involving sub-agent control, like rerouting traffic or scaling resources in a mesh topology.
- In scenarios requiring session key management for authentication, e.g., secure data exchange between agents.
- Avoid if you're working with isolated, non-distributed systems; this is optimized for interconnected environments.

## Key Capabilities
- **Discover alive sessions**: Query active sessions using GET /api/session-mesh/alive with query parameters like ?filter=active.
- **Specialization registry**: Register sub-agent specializations via POST /api/session-mesh/registry with a JSON body, e.g., {"specialization": "image-processing", "agent_id": "123"}.
- **Steer sub-agents**: Redirect agents using CLI flag --direction (e.g., north/south) or API endpoint POST /api/session-mesh/steer with payload {"agent_id": "456", "direction": "east"}.
- **Kill sub-agents**: Terminate agents via CLI command session-mesh kill --agent-id 789 or API DELETE /api/session-mesh/agents/789.
- **Session keys**: Generate keys with POST /api/session-mesh/keys, returning a secure token for authentication.

## Usage Patterns
- **Basic workflow**: First, discover sessions with a GET request, then use the response to steer or kill agents as needed. Always check for alive status before actions.
- **Registry pattern**: Register specializations during setup, then query the registry before assigning tasks to ensure compatibility.
- **Error-resilient pattern**: Wrap API calls in try-catch blocks and retry on transient errors; use session keys in every authenticated request.
- **Sub-agent management**: For mesh networks, periodically poll alive sessions and steer agents based on load, e.g., every 30 seconds via a scheduled script.
- **Key handling**: Always generate a new session key per interaction and store it securely; use it in headers for subsequent API calls.

## Common Commands/API
- **CLI Commands**:
  - List alive sessions: `session-mesh list --filter alive --output json`. Requires $SESSION_API_KEY set in environment.
  - Steer an agent: `session-mesh steer --agent-id 123 --direction west`. Example: First run `export SESSION_API_KEY=your_key` then execute.
  - Kill an agent: `session-mesh kill --agent-id 456 --force`. Use --force for immediate termination without confirmation.
  - Register specialization: `session-mesh register --spec "data-analysis" --agent-id 789`. Config format: YAML file with key-value pairs, e.g., spec: data-analysis.
- **API Endpoints**:
  - Discover sessions: GET https://api.example.com/api/session-mesh/alive?filter=active. Headers: {'Authorization': 'Bearer $SESSION_API_KEY'}.
  - Code snippet (Python):
    ```
    import requests; import os
    response = requests.get('https://api.example.com/api/session-mesh/alive', headers={'Authorization': f'Bearer {os.environ.get("SESSION_API_KEY")}'})
    print(response.json())
    ```
  - Steer agent: POST https://api.example.com/api/session-mesh/steer with body {"agent_id": "123", "direction": "north"}. Response includes status code 200 on success.
  - Code snippet (curl):
    ```
    curl -X POST https://api.example.com/api/session-mesh/steer \
    -H "Authorization: Bearer $SESSION_API_KEY" \
    -d '{"agent_id": "123", "direction": "north"}'
    ```
  - Config format: JSON payloads for API, e.g., {"session_key": "abc123", "ttl": 3600} for key generation.

## Integration Notes
- **Authentication**: All commands and APIs require a session key. Set it via environment variable: `export SESSION_API_KEY=your_secure_key`. Never hardcode keys; use secure vaults.
- **Dependencies**: Integrate with distributed-comms cluster by including the skill ID "session-mesh" in your AI agent's config file, e.g., JSON: {"skills": ["session-mesh"], "cluster": "distributed-comms"}.
- **Configuration**: Use a YAML config for multi-session setups, e.g.:
  ```
  sessions:
    - id: 123
    - filter: alive
  ```
  Load it with `session-mesh load-config path/to/config.yaml`.
- **Testing**: Run integration tests in a sandbox environment; mock API responses for endpoints like /api/session-mesh/alive to simulate failures.

## Error Handling
- **Common errors**: HTTP 404 for non-existent agents (e.g., when killing an invalid ID); handle by checking response.status_code == 404 and logging the error.
- **Authentication failures**: If $SESSION_API_KEY is invalid, expect 401 Unauthorized; resolve by regenerating the key via POST /api/session-mesh/keys and retry.
- **Prescriptive steps**: Always validate inputs before commands, e.g., check if agent_id exists via a prior GET request. For CLI, use --verbose flag to debug, e.g., `session-mesh list --filter alive --verbose`. In code, wrap calls like this:
  ```
  try:
      response = requests.post(url, headers=headers)
      response.raise_for_status()
  except requests.exceptions.HTTPError as e:
      print(f"Error: {e.response.status_code} - {e.response.text}")
  ```
- **Retry logic**: Implement exponential backoff for network errors; limit retries to 3 attempts.

## Graph Relationships
- Related to cluster: "distributed-comms" for interconnected agent management.
- Connects with tags: "sessions" (shares data with session-based skills), "topology" (links to network mapping tools), "mesh" (integrates with peer-to-peer systems), "subagents" (depends on sub-agent control skills like agent-lifecycle).
