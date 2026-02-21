---
name: agentmail
cluster: community
description: "AI agent email: autonomous email management, classification, response drafting, scheduling"
tags: ["email","ai","agent","automation"]
dependencies: []
composes: []
similar_to: []
called_by: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "agent email autonomous manage classify respond draft schedule"
---

# agentmail

## Purpose
This skill enables an AI agent to autonomously manage emails, including classification, response drafting, and scheduling, using AI-driven automation for efficient email handling.

## When to Use
Use this skill for high-volume email inboxes, automated customer support, personal productivity workflows, or integrating email tasks into broader AI agent operations to reduce manual intervention.

## Key Capabilities
- Classify emails based on content, sender, or keywords using machine learning models.
- Draft response emails with customizable templates and tone adjustments.
- Schedule email sends or follow-ups based on user-defined rules or calendar integration.
- Manage email threads by summarizing, prioritizing, or archiving based on criteria.
- Integrate with email providers via APIs for real-time operations.

## Usage Patterns
To use agentmail, invoke it via CLI or API calls, passing necessary parameters like email IDs or content. Always set the API key via environment variable `$AGENTMAIL_API_KEY`. For CLI, prefix commands with authentication flags. Example pattern: Fetch an email, classify it, draft a response, then schedule if needed. Chain commands in scripts for automation.

## Common Commands/API
CLI commands require Node.js environment; install via `npm install agentmail-cli`. API endpoints are under `https://api.openclaw.com/agentmail/v1`.

- **Classify an email:**  
  CLI: `agentmail classify --email-id 12345 --key $AGENTMAIL_API_KEY`  
  API: POST /api/agentmail/classify with JSON body: `{"email_id": "12345", "api_key": "$AGENTMAIL_API_KEY"}`  
  Code snippet:  
  ```bash
  curl -X POST https://api.openclaw.com/agentmail/v1/classify \
  -H "Content-Type: application/json" \
  -d '{"email_id": "12345", "api_key": "'$AGENTMAIL_API_KEY'"}'
  ```

- **Draft a response:**  
  CLI: `agentmail draft --email-id 12345 --tone professional --key $AGENTMAIL_API_KEY`  
  API: POST /api/agentmail/draft with body: `{"email_id": "12345", "tone": "professional", "api_key": "$AGENTMAIL_API_KEY"}`  
  Code snippet:  
  ```javascript
  const response = await fetch('https://api.openclaw.com/agentmail/v1/draft', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({email_id: '12345', tone: 'professional', api_key: process.env.AGENTMAIL_API_KEY})
  });
  ```

- **Schedule an email:**  
  CLI: `agentmail schedule --email-content "Reply text" --send-at "2023-10-01T10:00:00Z" --key $AGENTMAIL_API_KEY`  
  API: POST /api/agentmail/schedule with body: `{"email_content": "Reply text", "send_at": "2023-10-01T10:00:00Z", "api_key": "$AGENTMAIL_API_KEY"}`  
  Config format: Use JSON for scheduling rules, e.g., `{"rules": [{"condition": "priority>high", "action": "schedule in 2 hours"}]}`.

## Integration Notes
Integrate agentmail with email services like Gmail or Outlook by providing OAuth tokens via config files (e.g., `config.json: {"provider": "gmail", "token": "$GMAIL_TOKEN"}`). For AI agent workflows, use webhooks to trigger on new emails (e.g., POST to /api/agentmail/webhook). Ensure compatibility by matching API versions; handle dependencies like Node.js v14+. To combine with other skills, export results as JSON and pipe to next command, e.g., `agentmail classify ... | jq '.category' | other-skill-process`.

## Error Handling
Check for HTTP status codes: 401 for auth failures (retry with `$AGENTMAIL_API_KEY`), 404 for missing emails (log and skip), 500 for server errors (exponential backoff). In CLI, use `--verbose` flag for detailed logs. Handle common issues like rate limits by adding delays (e.g., sleep 5 seconds after 429 response). Validate inputs before calls, e.g., ensure email IDs are strings via regex check: `if (!emailId.match(/^\d+$/)) throw new Error('Invalid email ID');`. Use try-catch in scripts for graceful recovery.

## Concrete Usage Examples
1. **Classify and respond to a support ticket email:** First, classify: `agentmail classify --email-id 67890 --key $AGENTMAIL_API_KEY`. If classified as "support", draft: `agentmail draft --email-id 67890 --tone helpful --key $AGENTMAIL_API_KEY`. Then schedule: `agentmail schedule --email-content $(cat response.txt) --send-at now --key $AGENTMAIL_API_KEY`. This automates ticket responses in a helpdesk workflow.

2. **Manage personal email scheduling:** Fetch unread emails via API, classify them: `curl -X POST https://api.openclaw.com/agentmail/v1/classify -d '{"email_id": "54321", "api_key": "'$AGENTMAIL_API_KEY'"}'`. For high-priority, draft and schedule: `agentmail draft --email-id 54321 --tone formal --key $AGENTMAIL_API_KEY; agentmail schedule --email-content "Follow up" --send-at "tomorrow" --key $AGENTMAIL_API_KEY`. Use in a daily script for inbox zero.

## Graph Relationships
- Related to: email (direct), ai (cluster), agent (cluster), automation (tag).
- Connected clusters: community (same as this skill).
- Dependencies: May require skills like "email-parser" for input preprocessing or "scheduler" for advanced timing.
