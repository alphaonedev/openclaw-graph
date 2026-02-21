---
name: twilio-whatsapp
cluster: twilio
description: "WhatsApp Business: template messages, session messages, media, webhooks, opt-in management"
tags: ["whatsapp","twilio","messaging"]
dependencies: []
composes: []
similar_to: []
called_by: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "twilio whatsapp business template session message webhook media"
---

# twilio-whatsapp

## Purpose
This skill integrates with Twilio's WhatsApp Business API to handle messaging, templates, media, webhooks, and opt-in management for automated communication workflows.

## When to Use
Use this skill for scenarios requiring programmatic WhatsApp interactions, such as sending customer notifications, processing incoming messages via webhooks, managing opt-ins for compliance, or handling media-rich communications. Apply it in customer support bots, marketing campaigns, or IoT alerts where WhatsApp is the preferred channel.

## Key Capabilities
- Send template messages using pre-approved WhatsApp templates for automated broadcasts.
- Handle session messages for real-time conversations, including text and media.
- Manage media uploads and sharing, such as images or documents, via the API.
- Set up webhooks to receive incoming messages and events for event-driven processing.
- Implement opt-in management to track user consents and ensure regulatory compliance.

## Usage Patterns
Always initialize the Twilio client with environment variables for authentication. For sending messages, use the Messages API endpoint; for webhooks, configure a server endpoint to receive POST requests. Pattern 1: Send a template message in a script. Pattern 2: Handle incoming webhooks in a web server. Use HTTPS for all API calls to ensure security.

Example 1: Send a simple text message:
```python
import os
from twilio.rest import Client
client = Client(os.environ['TWILIO_ACCOUNT_SID'], os.environ['TWILIO_AUTH_TOKEN'])
client.messages.create(body='Hello from Twilio', from_='whatsapp:+14155551234', to='whatsapp:+15551234567')
```

Example 2: Send a template message with variables:
```python
message = client.messages.create(
    from_='whatsapp:+14155551234',
    to='whatsapp:+15551234567',
    content_sid='YourTemplateSID',
    content_variables='{"1": "John"}'
)
```

## Common Commands/API
Use Twilio's REST API or CLI for interactions. Base API endpoint: `https://api.twilio.com/2010-04-01`. Authenticate with `$TWILIO_ACCOUNT_SID` and `$TWILIO_AUTH_TOKEN` as env vars.

- CLI command to send a message: `twilio api:core:messages:create --body "Hello" --from "whatsapp:+14155551234" --to "whatsapp:+15551234567"`
- API endpoint for messages: POST to `/2010-04-01/Accounts/{AccountSid}/Messages.json` with JSON body like `{"Body": "Hello", "From": "whatsapp:+14155551234", "To": "whatsapp:+15551234567"}`
- For templates: POST to `/2010-04-01/Accounts/{AccountSid}/Messages.json` with `ContentSid` parameter, e.g., `{"ContentSid": "TemplateID", "To": "whatsapp:+15551234567"}`
- Webhook setup: Configure in Twilio Console to point to your URL (e.g., `https://yourserver.com/webhook`), and handle incoming POST requests with JSON payloads like `{"MessageSid": "SM123", "Body": "Reply text"}`
- Media handling: Upload via POST to `/2010-04-01/Accounts/{AccountSid}/Messages/{MessageSid}/Media.json`, then reference in messages.
- Opt-in management: Use Twilio's phone number management API, e.g., GET `/2010-04-01/Accounts/{AccountSid}/IncomingPhoneNumbers/{Sid}.json` to check opt-in status.

## Integration Notes
Set up a Twilio account and obtain `$TWILIO_ACCOUNT_SID` and `$TWILIO_AUTH_TOKEN` from the dashboard. Install the Twilio Python library via `pip install twilio`. For webhooks, expose an HTTPS endpoint (e.g., using Flask) and verify requests with Twilio's signature: check `X-Twilio-Signature` header against a computed signature using your auth token. Config format for API calls: JSON payloads in requests, e.g., `{"To": "whatsapp:+number", "Body": "Message"}`. Ensure your WhatsApp number is verified in Twilio Console before use.

## Error Handling
Check HTTP status codes from API responses: 4xx for client errors (e.g., 400 Bad Request for invalid parameters) and 5xx for server errors. Use try-except blocks in code, e.g.:
```python
try:
    message = client.messages.create(...)
except TwilioException as e:
    print(f"Error: {e.code} - {e.msg}")  # e.code might be '20003' for authentication issues
```
Common errors: 401 Unauthorized if env vars are missing; 21614 for WhatsApp policy violations (e.g., sending to non-opted-in users). Retry transient errors (5xx) with exponential backoff, and log details including the error code for debugging.

## Graph Relationships
- Related to: twilio-core (for shared authentication and base API functions)
- Connected via: twilio cluster (enables chaining with other Twilio skills like twilio-sms for multi-channel messaging)
- Tags overlap: whatsapp (links to messaging-focused skills), twilio (groups all Twilio-related capabilities)
