---
name: twilio-admin
cluster: twilio
description: "Admin: sub-account lifecycle, usage monitoring, number management, compliance SHAKEN/STIR TCR, audit logs"
tags: ["admin","billing","compliance","twilio"]
dependencies: []
composes: []
similar_to: []
called_by: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "twilio admin sub-account usage billing compliance numbers tcr shaken"
---

# twilio-admin

## Purpose
This skill handles administrative tasks for Twilio, including managing sub-account lifecycles (create, update, delete), monitoring usage and billing, managing phone numbers, ensuring compliance with SHAKEN/STIR and TCR standards, and accessing audit logs.

## When to Use
Use this skill when performing account administration, such as onboarding new sub-accounts, tracking monthly usage to avoid overages, managing phone number inventory, verifying compliance for regulatory requirements, or investigating issues via audit logs.

## Key Capabilities
- Sub-account lifecycle: Create, update, or delete sub-accounts via Twilio API.
- Usage monitoring: Fetch and analyze billing usage data for calls, SMS, and other resources.
- Number management: Search, purchase, and release phone numbers.
- Compliance: Validate and manage SHAKEN/STIR attestation and TCR (Traffic Control Regulations) submissions.
- Audit logs: Retrieve and filter logs for security and operational reviews.

## Usage Patterns
Always authenticate requests using environment variables like `$TWILIO_ACCOUNT_SID` and `$TWILIO_AUTH_TOKEN`. Use HTTP requests to the Twilio API base URL (https://api.twilio.com/2010-04-01). For CLI, install Twilio CLI and log in with `twilio login`. Pattern: Wrap API calls in try-catch blocks for error handling; use JSON payloads for POST requests. Configure API keys in .env files as `TWILIO_ACCOUNT_SID=your_sid` and `TWILIO_AUTH_TOKEN=your_token`.

## Common Commands/API
Use Twilio API endpoints with HTTP methods. For authentication, include Basic Auth with `$TWILIO_ACCOUNT_SID` and `$TWILIO_AUTH_TOKEN`.

- List sub-accounts: GET https://api.twilio.com/2010-04-01/Accounts.json
  Code snippet:
  ```
  curl -X GET 'https://api.twilio.com/2010-04-01/Accounts.json' \
  -u $TWILIO_ACCOUNT_SID:$TWILIO_AUTH_TOKEN
  ```

- Create a sub-account: POST https://api.twilio.com/2010-04-01/Accounts.json with JSON body {"FriendlyName": "SubAccountName"}
  Code snippet:
  ```
  curl -X POST 'https://api.twilio.com/2010-04-01/Accounts.json' \
  -u $TWILIO_ACCOUNT_SID:$TWILIO_AUTH_TOKEN -d 'FriendlyName=SubAccount1'
  ```

- Monitor usage: GET https://api.twilio.com/2010-04-01/Accounts/{AccountSid}/Usage.json?Category=calls
  Code snippet:
  ```
  curl -X GET 'https://api.twilio.com/2010-04-01/Accounts/$TWILIO_ACCOUNT_SID/Usage/Records.json?Category=sms' \
  -u $TWILIO_ACCOUNT_SID:$TWILIO_AUTH_TOKEN
  ```

- Manage numbers: GET https://api.twilio.com/2010-04-01/IncomingPhoneNumbers.json to list, or POST to purchase.
  Code snippet:
  ```
  curl -X POST 'https://api.twilio.com/2010-04-01/Accounts/$TWILIO_ACCOUNT_SID/IncomingPhoneNumbers.json' \
  -u $TWILIO_ACCOUNT_SID:$TWILIO_AUTH_TOKEN -d 'PhoneNumber=+1234567890'
  ```

- Check compliance: GET https://api.twilio.com/2010-04-01/RegulatoryCompliance/EndUsers.json for TCR, or use SHAKEN/STIR via voice calls API.
  Code snippet:
  ```
  curl -X GET 'https://api.twilio.com/2010-04-01/Accounts/$TWILIO_ACCOUNT_SID/Calls.json?Attestation=STIR' \
  -u $TWILIO_ACCOUNT_SID:$TWILIO_AUTH_TOKEN
  ```

- Access audit logs: GET https://api.twilio.com/2010-04-01/Accounts/{AccountSid}/Usage/Logs.json
  CLI equivalent: `twilio api:core:accounts:usage:logs:list --account-sid $TWILIO_ACCOUNT_SID`

## Integration Notes
Integrate by exporting env vars like `export TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` and `export TWILIO_AUTH_TOKEN=your_auth_token`. Use libraries such as Twilio's Node.js SDK: `const client = require('twilio')($TWILIO_ACCOUNT_SID, $TWILIO_AUTH_TOKEN);`. For config formats, use JSON for API requests, e.g., {"subresource_uris": {}}. Combine with other tools via webhooks; ensure SSL for secure endpoints. If using in scripts, handle rate limits by adding delays between requests.

## Error Handling
Check HTTP status codes: 401 for auth failures—re-authenticate using fresh tokens; 404 for missing resources—verify AccountSid; 429 for rate limits—retry after delay using exponential backoff. In code, use try-catch: 
```
try {
  const response = await fetch('https://api.twilio.com/2010-04-01/Accounts.json', { headers: { Authorization: 'Basic ' + btoa($TWILIO_ACCOUNT_SID + ':' + $TWILIO_AUTH_TOKEN) } });
  if (!response.ok) throw new Error(response.status);
} catch (error) {
  console.error('Error:', error.message); // Handle by logging and retrying
}
```
Parse JSON errors for details like "code": 20003 for invalid parameters.

## Concrete Usage Examples
1. Create a sub-account and assign a number: First, run the create sub-account command, then use the new sub-account SID to purchase a number. Example script:
   ```
   curl -X POST 'https://api.twilio.com/2010-04-01/Accounts.json' -u $TWILIO_ACCOUNT_SID:$TWILIO_AUTH_TOKEN -d 'FriendlyName=NewSub'
   curl -X POST 'https://api.twilio.com/2010-04-01/Accounts/[new_sid]/IncomingPhoneNumbers.json' -u $TWILIO_ACCOUNT_SID:$TWILIO_AUTH_TOKEN -d 'PhoneNumber=+1234567890'
   ```
   This sets up a new sub-account with a dedicated number for isolated testing.

2. Monitor usage and ensure compliance: Fetch usage records and check for SHAKEN/STIR compliance. Example:
   ```
   curl -X GET 'https://api.twilio.com/2010-04-01/Accounts/$TWILIO_ACCOUNT_SID/Usage/Records.json?Category=calls' -u $TWILIO_ACCOUNT_SID:$TWILIO_AUTH_TOKEN
   curl -X GET 'https://api.twilio.com/2010-04-01/Accounts/$TWILIO_ACCOUNT_SID/Calls.json?Attestation=STIR' -u $TWILIO_ACCOUNT_SID:$TWILIO_AUTH_TOKEN
   ```
   Use this to review monthly call usage and verify that all calls have proper attestation to meet TCR requirements.

## Graph Relationships
- Connected to cluster: twilio (shares core API access).
- Related via tags: admin (links to other admin tools), billing (connects to payment systems), compliance (ties to regulatory skills), twilio (groups with twilio-core and twilio-messaging).
- Dependency: Requires twilio-auth for key management.
