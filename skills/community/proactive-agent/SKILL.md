---
name: proactive-agent
cluster: community
description: "Proactive task initiation: monitor conditions, trigger actions without user prompting, autonomous ops"
tags: ["proactive","autonomous","monitoring","ai"]
dependencies: []
composes: []
similar_to: []
called_by: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "proactive agent autonomous monitor trigger action no prompt"
---

# proactive-agent

## Purpose
This skill enables OpenClaw to act as a proactive agent, monitoring system conditions and triggering predefined actions autonomously without user input. It's designed for scenarios requiring continuous oversight, such as resource monitoring or automated responses, leveraging AI to reduce manual intervention.

## When to Use
Use this skill when you need autonomous operations, like monitoring server metrics and reacting to thresholds, or triggering workflows based on events without prompts. Apply it in production environments for error prevention, in IoT setups for real-time responses, or in CI/CD pipelines for automated fixes.

## Key Capabilities
- Monitor conditions using configurable rules, e.g., CPU usage > 80% or file size > 1GB.
- Trigger actions like executing scripts, sending notifications, or calling APIs without user interaction.
- Support for periodic checks (e.g., every 5 minutes) or event-driven triggers.
- Integration with external services via webhooks or APIs for seamless autonomous ops.
- Logging and state tracking to maintain audit trails of triggered actions.

## Usage Patterns
To use this skill, first define a configuration file specifying monitors and actions, then start the agent via CLI or API. Always set up authentication first. For example, run the agent in a loop for continuous monitoring or integrate it into a larger script for conditional starts. Ensure monitors are tested in a staging environment before production deployment.

## Common Commands/API
Use the OpenClaw CLI for quick starts or the REST API for programmatic control. Authentication requires setting the environment variable `$OPENCLAW_API_KEY` before commands.

- **CLI Command**: Start the agent with a config file.
  ```
  openclaw proactive-agent start --config path/to/config.json --interval 300
  ```
  This monitors conditions every 300 seconds; use `--dry-run` to simulate without actions.

- **API Endpoint**: Trigger or query the agent via HTTP.
  POST /api/v1/proactive-agent/run with body: {"monitor": "cpu>80", "action": "restart"}
  ```
  curl -H "Authorization: Bearer $OPENCLAW_API_KEY" -X POST -d '{"monitor":"cpu>80","action":"restart"}' https://api.openclaw.com/api/v1/proactive-agent/run
  ```
  Response includes status and any errors.

- **Config Format**: JSON file defining rules.
  ```
  {
    "monitors": [{"type": "cpu", "threshold": ">80"}],
    "actions": [{"type": "exec", "command": "systemctl restart service"}]
  }
  ```
  Load this via CLI or API to define what to monitor and act on.

- **Stop Command**: Halt the agent gracefully.
  ```
  openclaw proactive-agent stop --id agent123
  ```
  Use the `--id` flag from the start command output.

## Integration Notes
Integrate this skill by embedding it into scripts or services. For example, combine with monitoring tools like Prometheus by setting up webhooks: in your config, add `"webhook": "https://your-service.com/hook"` to notify external systems. Use the API in Node.js applications:
  ```
  const fetch = require('node-fetch');
  fetch('https://api.openclaw.com/api/v1/proactive-agent/run', { method: 'POST', headers: { 'Authorization': `Bearer ${process.env.OPENCLAW_API_KEY}` }, body: JSON.stringify({monitor: 'memory>90', action: 'alert'})});
  ```
  Ensure your environment has `$OPENCLAW_API_KEY` set. For containerized setups, mount config files as volumes and run the agent as a sidecar.

## Error Handling
Handle errors by checking exit codes from CLI commands (e.g., non-zero indicates failure) and parsing API responses for error fields like "error_code: 403". Common issues include invalid configs—validate JSON with `openclaw proactive-agent validate --config path/to/config.json` before running. For runtime errors, set up logging in your config: `"log_level": "debug"` to capture details, and implement retries in scripts, e.g.:
  ```
  try {
    await fetch('https://api.openclaw.com/api/v1/proactive-agent/run', options);
  } catch (error) {
    console.error('Retry in 5s:', error);
    setTimeout(() => { /* retry logic */ }, 5000);
  }
  ```
  Monitor for authentication failures by verifying `$OPENCLAW_API_KEY` is current.

## Graph Relationships
- Related to: monitoring-agent (shares monitoring capabilities)
- Depends on: autonomous-ops (for action execution frameworks)
- Clusters with: community (as per metadata grouping)
- Tagged with: proactive, autonomous, monitoring, ai (for cross-skill queries)
