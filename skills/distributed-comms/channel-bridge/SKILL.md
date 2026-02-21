---
name: channel-bridge
cluster: distributed-comms
description: "Cross-channel routing: Signal/TG/Discord formatting, message vs sessions_send, broadcast, reactions"
tags: ["signal","telegram","discord","messaging","channel"]
dependencies: []
composes: []
similar_to: []
called_by: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "channel signal telegram discord message send broadcast route format reactions"
---

# channel-bridge

## Purpose
This skill facilitates cross-channel messaging routing between Signal, Telegram, and Discord. It handles message formatting (e.g., converting Markdown to plain text), differentiates between simple message sends and session-based transmissions, supports broadcasting to multiple channels, and manages reactions across platforms.

## When to Use
Use this skill when integrating disparate messaging apps, such as forwarding alerts from Signal to Discord for team notifications, broadcasting updates across Telegram and Signal for distributed teams, or routing user reactions (e.g., likes) from Discord to Signal for unified feedback tracking. Apply it in scenarios requiring real-time cross-platform communication without manual intervention.

## Key Capabilities
- **Message Formatting**: Automatically converts content formats; e.g., use Discord's Markdown syntax and strip it for Signal via the `format` flag.
- **Routing Options**: Distinguishes between `message` (simple send) and `sessions_send` (persistent session-based routing) using API parameters like `type: "message"` or `type: "sessions_send"`.
- **Broadcasting**: Sends messages to multiple channels simultaneously; e.g., specify targets with a JSON array like `["signal:group1", "discord:channel2"]`.
- **Reactions Handling**: Propagates reactions (e.g., emojis) across platforms; e.g., map Discord reactions to Signal reactions via a predefined config mapping.
- **Error Resilience**: Includes retry logic for failed transmissions, with configurable thresholds.

## Usage Patterns
Always initialize with authentication via environment variables (e.g., `$SIGNAL_API_KEY`, `$TELEGRAM_BOT_TOKEN`). For CLI, pipe inputs directly; for API, use HTTP requests with JSON payloads. Pattern 1: Single-channel routing—send a message from one platform to another. Pattern 2: Broadcast—specify multiple targets in a single command. Pattern 3: Reaction handling—monitor and forward reactions using webhooks. Validate inputs first (e.g., check message length limits per platform: Signal=4096 chars, Discord=2000 chars). For sessions, establish a persistent connection by including `--session-id` in commands.

## Common Commands/API
Use the CLI tool or REST API for interactions. CLI commands require the `channel-bridge` binary; API endpoints are under `/api/v1/`.

- **CLI Command for Sending a Message**:
  ```
  channel-bridge send --from signal --to telegram --message "Hello team" --format markdown
  ```
  This routes a formatted message; add `--broadcast` for multi-target, e.g., `--to "discord:channel1,signal:group2"`.

- **API Endpoint for Sessions Send**:
  POST /api/v1/sessions_send
  Body: `{"from": "discord", "to": ["telegram"], "content": "Update", "type": "sessions_send", "session_id": "abc123"}`
  Include headers: `Authorization: Bearer $DISCORD_API_KEY`.

- **CLI for Broadcasting with Reactions**:
  ```
  channel-bridge broadcast --from tg --to "signal,discord" --message "Alert" --reactions true
  ```
  This enables reaction forwarding; reactions are mapped via a config file, e.g., JSON: `{"👍": "thumbsup"}`.

- **API for Reaction Handling**:
  POST /api/v1/reactions
  Body: `{"source": "discord", "reaction": "👍", "targets": ["signal"]}`
  Use this to propagate reactions; requires prior webhook setup.

Config format: Use a YAML file for platform settings, e.g.:
```
signal:
  api_key: $SIGNAL_API_KEY
  default_group: group1
telegram:
  bot_token: $TELEGRAM_BOT_TOKEN
```

## Integration Notes
Integrate by setting environment variables for authentication: e.g., export `$SIGNAL_API_KEY` for Signal access. For API integrations, use libraries like `requests` in Python:
```
import requests
response = requests.post('http://localhost:8080/api/v1/send', json={'from': 'tg', 'to': 'discord', 'message': 'Test'}, headers={'Authorization': f'Bearer {os.environ["TELEGRAM_BOT_TOKEN"]}'})
```
Ensure your app handles platform-specific requirements, like Discord webhooks for real-time updates. For multi-service setups, chain this skill with other distributed-comms tools via shared session IDs. Test integrations in a sandbox environment first.

## Error Handling
Check response codes from commands/API; e.g., CLI returns non-zero exit codes for failures. Common errors: 401 for auth issues (verify $SERVICE_API_KEY), 400 for invalid formats (e.g., mismatched message types). Implement retries with exponential backoff: in code, use a loop like:
```
for attempt in range(3):
    try:
        response = requests.post(...)  # API call
        break
    except Exception as e:
        if attempt == 2:
            log_error(e)
```
Log errors with details (e.g., "Failed broadcast: Signal timeout") and use the `--debug` flag in CLI for verbose output. For reactions, handle platform mismatches by skipping unsupported types.

## Usage Examples
1. **Route a Message from Telegram to Signal and Discord**: Use this for alerts: `channel-bridge send --from tg --to "signal:alerts, discord:general" --message "System down" --format plain`. This broadcasts the message, formats it appropriately, and logs the transmission ID for tracking.
2. **Handle Reactions in a Broadcast Scenario**: For feedback loops: `channel-bridge broadcast --from discord --to "tg:group1" --message "Vote now" --reactions true`. If a user reacts with 👍 on Discord, it forwards as a custom emoji to Telegram, using the reaction mapping from your config.

## Graph Relationships
- **Cluster Relation**: Belongs to "distributed-comms" cluster, enabling interoperability with other comms skills.
- **Service Links**: Interacts with "signal" for messaging, "telegram" for bot operations, and "discord" for webhook events.
- **Tag Connections**: Associated with tags ["signal", "telegram", "discord", "messaging", "channel"], linking to related skills in the graph.
