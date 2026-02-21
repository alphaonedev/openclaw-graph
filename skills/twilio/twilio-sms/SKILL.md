---
name: twilio-sms
cluster: twilio
description: "SMS/MMS: send/receive, TwiML, webhooks, delivery receipts, opt-out, A2P 10DLC, short codes"
tags: ["sms","mms","twilio","messaging"]
dependencies: []
composes: []
similar_to: []
called_by: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "twilio sms mms send receive webhook 10dlc opt-out delivery"
---

# twilio-sms

## Purpose
This skill handles SMS and MMS operations using Twilio's API, including sending/receiving messages, managing webhooks, processing delivery receipts, handling opt-outs, and supporting A2P 10DLC and short codes. It's designed for integrating messaging into applications.

## When to Use
Use this skill for applications requiring real-time messaging, such as user notifications, two-factor authentication, customer support bots, or marketing campaigns. Apply it when you need to track message status, handle inbound messages via webhooks, or comply with regulations like opt-outs and 10DLC registration.

## Key Capabilities
- Send SMS/MMS: Programmatically send messages with customizable content, media, and sender IDs.
- Receive messages: Set up webhooks to process incoming SMS/MMS.
- Handle webhooks: Use TwiML to respond to incoming messages dynamically.
- Manage delivery receipts: Track message status (e.g., delivered, failed) via callbacks.
- Opt-out handling: Automatically process stop words like "STOP" to comply with regulations.
- A2P 10DLC support: Register and use 10-digit long codes for high-volume messaging in the US.
- Short codes: Leverage Twilio's short codes for rapid, high-throughput messaging.

## Usage Patterns
Always initialize the Twilio client with your Account SID and Auth Token from environment variables. For sending messages, use the Messages API endpoint. For receiving, configure a webhook URL in your Twilio console. Handle asynchronous operations like delivery receipts by setting up callback URLs. Use HTTPS for all endpoints to ensure security. Test in Twilio's sandbox before production.

## Common Commands/API
Use the Twilio REST API for core operations. Set environment variables for authentication: `export TWILIO_ACCOUNT_SID=$TWILIO_ACCOUNT_SID` and `export TWILIO_AUTH_TOKEN=$TWILIO_AUTH_TOKEN`.

- **Send SMS**: POST to https://api.twilio.com/2010-04-01/Accounts/{AccountSid}/Messages.json with parameters like `To`, `From`, and `Body`.
  Code snippet (Python):
  ```
  from twilio.rest import Client
  client = Client(os.environ['TWILIO_ACCOUNT_SID'], os.environ['TWILIO_AUTH_TOKEN'])
  message = client.messages.create(body='Hello', from_='+1234567890', to='+0987654321')
  ```

- **Receive SMS via Webhook**: Set up a POST endpoint at your server to handle incoming requests from https://api.twilio.com/2010-04-01/Accounts/{AccountSid}/Messages.
  Code snippet (Node.js Express):
  ```
  app.post('/webhook', (req, res) => {
    const body = req.body.Body;
    if (body.toLowerCase() === 'stop') { handleOptOut(req.body.From); }
    res.set('Content-Type', 'text/xml'); res.send(twiMLResponse);
  });
  ```

- **Check Delivery Status**: Use the GET endpoint https://api.twilio.com/2010-04-01/Accounts/{AccountSid}/Messages/{MessageSid}.json to poll or handle via webhook callbacks.
  Code snippet (cURL):
  ```
  curl -X GET 'https://api.twilio.com/2010-04-01/Accounts/$TWILIO_ACCOUNT_SID/Messages/{MessageSid}.json' \
  -u $TWILIO_ACCOUNT_SID:$TWILIO_AUTH_TOKEN
  ```

- **Handle Opt-Out**: When receiving "STOP", add the number to a suppression list via Twilio's API.
  Code snippet (Python):
  ```
  client.messaging.v1.services('YourServiceSid').usecases('OptOut').phone_numbers.create(phone_number='+0987654321')
  ```

- **A2P 10DLC Configuration**: Register via Twilio Console under "Regulate > A2P 10DLC", then use the registered number in messages.

## Integration Notes
Integrate by installing the Twilio SDK (e.g., `pip install twilio` for Python). Use environment variables for keys to avoid hardcoding: `$TWILIO_ACCOUNT_SID` and `$TWILIO_AUTH_TOKEN`. For webhooks, expose an HTTPS endpoint and configure it in Twilio Console under "Phone Numbers > Manage > Webhooks". Handle TwiML responses by generating XML for dynamic replies. For MMS, include media URLs in the `MediaUrl` parameter. Ensure compliance by checking for opt-out keywords in every inbound message. If using short codes, request them via Twilio support and link to your account.

## Error Handling
Common errors include authentication failures (HTTP 401), invalid phone numbers (HTTP 400), or rate limits (HTTP 429). Check response codes and Twilio error codes (e.g., 21614 for invalid numbers). Use try-catch blocks for API calls:
Code snippet (Python):
```
try:
    message = client.messages.create(...)
except TwilioException as e:
    if e.code == 21614: log_error('Invalid phone number')
    else: retry_after_delay(e)
```
For webhooks, validate requests using Twilio's signature (e.g., via `twilio.request_validator`). Retry transient errors with exponential backoff. Log all errors with full details for debugging.

## Graph Relationships
- Belongs to cluster: twilio
- Related skills: twilio-voice (for voice calls), twilio-webhooks (for general webhook handling), twilio-messaging (for broader messaging services)
- Dependencies: Requires twilio-api for core functionality
- Integrations: Connects with external services like webhook endpoints or CRM systems for message processing
