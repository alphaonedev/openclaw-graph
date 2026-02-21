---
name: sre-runbooks
cluster: devops-sre
description: "Provides standardized SRE runbooks for incident response and system maintenance in DevOps environments."
tags: ["sre","runbooks","devops"]
dependencies: []
composes: []
similar_to: []
called_by: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "sre runbooks devops incident response maintenance procedures"
---

# sre-runbooks

## Purpose
This skill delivers standardized SRE runbooks for managing incidents and performing system maintenance in DevOps environments. It accesses pre-defined procedures to ensure consistent responses to issues like outages or upgrades.

## When to Use
Use this skill during active incidents for quick reference, routine maintenance tasks, or when onboarding new SRE team members. Apply it in production environments facing downtime, scaling issues, or compliance checks to follow best practices.

## Key Capabilities
- Retrieve runbooks by ID, type, or keyword (e.g., "outage" or "database").
- Execute automated steps from runbooks, such as running scripts or API calls.
- Generate custom checklists based on runbook templates for specific environments.
- Integrate with monitoring tools to trigger runbooks on alerts.
- Support versioning of runbooks for tracking changes over time.

## Usage Patterns
Invoke this skill via the `sre-cli` tool or API calls from your AI agent code. Always set the environment variable `$SRE_API_KEY` for authentication before use. For CLI, prefix commands with authentication checks. In code, import the skill as a module and call functions with required parameters. Example pattern: Check if the runbook exists first, then execute it in a try-catch block.

## Common Commands/API
Use the `sre-cli` for direct access or the REST API for programmatic integration. All commands require `$SRE_API_KEY` set in the environment.

- CLI Command: List runbooks  
  `sre-cli runbook list --filter sre --output json`  
  This fetches a JSON list of SRE-tagged runbooks; use `--filter` for tags like "devops".

- CLI Command: Get a specific runbook  
  `sre-cli runbook get --id 456 --format markdown`  
  Retrieves runbook ID 456 in Markdown; add `--format yaml` for YAML output.

- API Endpoint: Retrieve runbook  
  GET https://api.openclaw.com/sre-runbooks/v1/runbooks/{id}  
  Headers: Authorization: Bearer $SRE_API_KEY  
  Response: JSON object with runbook details, e.g., {"id": 456, "steps": ["Step 1: Check logs"]}.

- API Endpoint: Execute runbook step  
  POST https://api.openclaw.com/sre-runbooks/v1/runbooks/{id}/execute  
  Body: {"step": 1, "params": {"environment": "prod"}}  
  This runs the first step of the runbook with production parameters.

Config formats use JSON or YAML for inputs. Example config file (`runbook-config.json`):  
{  
  "id": "789",  
  "environment": "dev",  
  "overrides": {"timeout": 300}  
}

## Integration Notes
Integrate this skill with your AI agent's workflow by adding it as a dependency in your codebase. Use `$SRE_API_KEY` for auth; set it via environment variables in deployment scripts. For example, in a Node.js app, install via `npm install sre-runbooks-sdk`, then import and initialize:  
const sreSDK = require('sre-runbooks-sdk');  
sreSDK.init({ apiKey: process.env.SRE_API_KEY, baseUrl: 'https://api.openclaw.com' });  
Ensure your agent handles rate limits (e.g., 100 requests/min) by implementing retry logic with exponential backoff. For CI/CD, embed runbooks in pipelines using webhooks to trigger on Git events.

## Error Handling
Always wrap skill invocations in error handlers. For CLI commands, check exit codes and parse stderr. For API calls, catch HTTP errors (e.g., 401 for auth failures, 404 for missing runbooks). Example in Python:  
import sre_runbooks  
try:  
    response = sre_runbooks.get_runbook(id=123, api_key=os.environ['SRE_API_KEY'])  
except sre_runbooks.AuthError:  
    log_error("Authentication failed; check $SRE_API_KEY")  
except sre_runbooks.NotFoundError:  
    fallback_to_default_runbook()  
Common issues: Invalid API keys return 401; handle by prompting for re-auth. Rate limit errors (429) require a 5-second delay before retrying.

## Concrete Usage Examples
Example 1: Handle a database outage  
First, query for the relevant runbook: `sre-cli runbook get --id 123`. Then, execute the steps:  
steps = sre_runbooks.execute(id=123, params={"db_type": "postgres"})  
This retrieves and runs the outage procedure, outputting logs for review.

Example 2: Perform routine system maintenance  
Use the API to schedule a maintenance runbook:  
POST https://api.openclaw.com/sre-runbooks/v1/runbooks/456/schedule  
Body: {"time": "2023-10-01T02:00:00Z", "params": {"systems": ["web", "cache"]}}  
This automates updates, ensuring systems are patched without downtime.

## Graph Relationships
- Related to: devops-tools (for shared DevOps utilities)
- Depends on: monitoring-skills (for alert integration)
- Clusters with: devops-sre (primary cluster for this skill)
