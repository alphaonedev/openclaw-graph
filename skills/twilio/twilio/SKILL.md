---
name: twilio
cluster: twilio
description: "Twilio root: account management, API keys, sub-accounts, console, billing, rate limits, error codes"
tags: ["twilio","sms","voice","communications"]
dependencies: []
composes: []
similar_to: []
called_by: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "twilio account api key sub-account billing rate limit"
---

# twilio

## Purpose
This skill enables management of Twilio accounts, including API keys, sub-accounts, console access, billing, rate limits, and error codes, to handle communication services like SMS and voice.

## When to Use
Use this skill when you need to administer Twilio resources, such as creating sub-accounts for isolation, managing API keys for secure access, checking billing details to avoid overages, or troubleshooting rate limits and error codes in communication workflows.

## Key Capabilities
- Manage Twilio accounts: Create, update, or delete accounts via API.
- Handle API keys: Generate, rotate, or revoke keys for authentication.
- Sub-account operations: Create nested accounts for segmentation and permissions.
- Billing and monitoring: Retrieve invoices, check balances, and enforce rate limits.
- Error handling: Interpret Twilio error codes (e.g., 20003 for authentication failures) for debugging.
- Communications setup: Configure SMS/voice settings tied to accounts.

## Usage Patterns
Always authenticate using environment variables like `$TWILIO_ACCOUNT_SID` and `$TWILIO_AUTH_TOKEN`. Start by initializing a Twilio client in your code, then chain API calls for sequential operations. For CLI use, install Twilio CLI first with `npm install twilio-cli -g`, then log in via `twilio login`. Use patterns like fetching account details before modifying sub-accounts to avoid errors.

## Common Commands/API
- CLI command to list accounts: `twilio api:core:accounts:list --sid $TWILIO_ACCOUNT_SID`
- API endpoint for creating API keys: POST to `https://api.twilio.com/2010-04-01/Accounts/{AccountSid}/Keys.json` with auth headers.
- Code snippet for Twilio client in Python:
  ```python
  from twilio.rest import Client
  client = Client(os.environ['TWILIO_ACCOUNT_SID'], os.environ['TWILIO_AUTH_TOKEN'])
  key = client.keys.create()
  ```
- Command to check rate limits: `twilio api:core:usage-records:record --category sms --start-date 2023-01-01`
- API endpoint for sub-accounts: POST to `https://api.twilio.com/2010-04-01/Accounts.json` with JSON body like `{"friendlyName": "SubAccount1"}`.
- Config format for API requests: Use JSON payloads, e.g., `{"ttl": 3600}` for key expiration in key creation requests.

## Integration Notes
Integrate by setting `$TWILIO_ACCOUNT_SID` and `$TWILIO_AUTH_TOKEN` as environment variables in your application. For web apps, use libraries like Twilio's Python SDK or Node.js module to handle HTTP requests. When combining with other services, ensure rate limits (e.g., 1 message/second per number) are respected by implementing retry logic with exponential backoff. For console integration, use the Twilio API to fetch data and display in your UI, avoiding direct browser access for security.

## Error Handling
Check HTTP status codes from Twilio API responses; for example, 401 means authentication failure, so verify `$TWILIO_AUTH_TOKEN`. Parse error codes like 21614 (rate limit exceeded) and respond by waiting and retrying. In code, wrap API calls in try-except blocks:
```python
try:
    response = client.messages.create(body='Hello', from_='+123456789', to='+098765432')
except TwilioException as e:
    if e.code == '21614': time.sleep(60)  # Wait 1 minute
```
Always log errors with details like the code and message for auditing.

## Graph Relationships
- Related to: sms (for messaging capabilities), voice (for call management), communications (as overarching category).
- Connected via: twilio cluster for shared resources like API keys and accounts.
