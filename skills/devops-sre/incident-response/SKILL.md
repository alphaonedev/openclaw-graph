---
name: incident-response
cluster: devops-sre
description: "Manages detection, analysis, containment, and recovery of security incidents in DevOps environments."
tags: ["incident-response","security","devops"]
dependencies: []
composes: []
similar_to: []
called_by: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "incident response security devops sre monitoring detection recovery"
---

## Purpose

This skill enables OpenClaw to manage the full incident response lifecycle in DevOps environments, including detection, analysis, containment, and recovery of security incidents, using automated tools and integrations.

## When to Use

Use this skill when monitoring detects anomalies in DevOps pipelines (e.g., unusual traffic in Kubernetes clusters), during active breaches (e.g., unauthorized access), or for scheduled drills. Apply it in SRE workflows to minimize downtime, such as integrating with CI/CD tools for real-time alerts.

## Key Capabilities

- **Detection**: Scans logs and metrics via API endpoint `/api/incident/detect` with JSON payload like `{"source": "k8s-logs", "threshold": 0.8}` to identify threats based on predefined rules.
- **Analysis**: Parses incident data using CLI flag `--analyze-depth 2` to correlate events, e.g., linking IP addresses to user sessions.
- **Containment**: Isolates affected resources, such as pausing pods in Kubernetes with command `openclaw incident contain --resource pod-123 --action pause`.
- **Recovery**: Automates rollbacks or restores from backups, e.g., via API call to `/api/incident/recover` with payload `{"backup_id": "snapshot-456"}`.
- Supports integration with tools like Prometheus for monitoring and integrates SRE best practices for incident tracking.

## Usage Patterns

To use this skill, first set the environment variable for authentication: `export OPENCLAW_API_KEY=your_api_key`. Then, follow this pattern:

1. Authenticate and initialize: Run `openclaw auth --key $OPENCLAW_API_KEY` to set up sessions.
2. Detect incidents: Execute `openclaw incident detect --env prod --type network` to scan for issues.
3. Analyze results: Pipe output to analysis, e.g., `openclaw incident analyze --id 123 --format json`.
4. Contain if needed: Use `openclaw incident contain --id 123 --scope cluster` to isolate.
5. Recover: Call `openclaw incident recover --id 123 --backup latest` to restore.
For automated workflows, embed in scripts: Write a Bash snippet like:
```bash
export OPENCLAW_API_KEY=your_key
openclaw incident detect --env staging
if [ $? -ne 0 ]; then openclaw incident contain --id $(echo $output | jq .id); fi
```
Always validate inputs to avoid false positives, e.g., check JSON configs for required fields like `"threshold"`.

## Common Commands/API

- **CLI Commands**:
  - Detect: `openclaw incident detect --env dev --type app-vuln --threshold 0.7` (flags: `--env` for environment, `--type` for incident type, `--threshold` for sensitivity).
  - Analyze: `openclaw incident analyze --id 456 --depth 1` (flag: `--depth` for recursion level, outputs JSON with fields like `"affected_resources"`).
  - Contain: `openclaw incident contain --id 789 --action isolate --resource k8s-pod` (flag: `--action` for operations like isolate or block).
  - Recover: `openclaw incident recover --id 789 --method rollback` (flag: `--method` for strategies like rollback or restore).
- **API Endpoints** (all require Authorization header with `$OPENCLAW_API_KEY`):
  - POST `/api/incident/detect`: Body `{ "env": "prod", "type": "network" }` to trigger detection.
  - GET `/api/incident/analyze/{id}`: Query param `depth=2` for detailed analysis.
  - PUT `/api/incident/contain/{id}`: Body `{ "action": "isolate", "resource": "pod-123" }`.
  - POST `/api/incident/recover/{id}`: Body `{ "method": "rollback", "backup_id": "snapshot-abc" }`.
Config format: Use JSON files for inputs, e.g., `{"env": "staging", "types": ["app-vuln", "network"]}` in a file passed via `--config path/to/config.json`.

## Integration Notes

Integrate with DevOps tools by exporting data to monitoring systems like ELK Stack or Prometheus. For Kubernetes, use webhooks: Configure OpenClaw to send alerts via `openclaw incident hook --url https://your-k8s-webhook.com --event detect`. In CI/CD, add to Jenkins pipelines with a step like:
```groovy
stage('Incident Check') {
    sh 'openclaw incident detect --env prod > incident.log'
    if (readFile('incident.log').contains('alert')) { error 'Incident detected' }
}
```
For SRE, link with tools like PagerDuty by setting env vars: `export PAGERSERVICE_KEY=your_key` and use `openclaw incident notify --service pagerduty`. Ensure configs match formats, e.g., YAML for hooks: `hooks: - url: https://pagerduty.com events: [detect, analyze]`.

## Error Handling

Check CLI exit codes: 0 for success, 1 for detection errors (e.g., invalid flags), 2 for API failures. For APIs, parse HTTP responses: 400 for bad requests (e.g., missing fields in JSON), 401 for auth issues (verify `$OPENCLAW_API_KEY`). Handle in scripts like:
```bash
response=$(openclaw incident detect --env invalid)
if [ $? -eq 1 ]; then echo "Error: Invalid environment"; exit 1; fi
```
Log errors with `--verbose` flag for debugging, and retry transient errors (e.g., network issues) using loops in code. Always validate JSON responses for fields like `"error_code"` before proceeding.

## Concrete Usage Examples

1. **Detect and Contain a Network Incident in Staging**: In a DevOps pipeline, detect anomalies in staging env: Run `openclaw incident detect --env staging --type network`. If an incident ID is returned (e.g., 123), contain it with `openclaw incident contain --id 123 --action isolate`. This prevents spread during deployment tests.
   
2. **Analyze and Recover from an Application Vulnerability**: For a detected app vuln, analyze logs: Use `openclaw incident analyze --id 456 --depth 1` to get details, then recover by `openclaw incident recover --id 456 --method rollback --backup latest`. This restores the app from a snapshot in a production SRE scenario.

## Graph Relationships

- Connected to: devops-sre cluster (e.g., links to monitoring skill for log ingestion, deployment skill for auto-rollbacks).
- Tagged with: incident-response (shares edges with security skills), security (relates to access-control skills), devops (integrates with ci-cd skills).
