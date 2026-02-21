---
name: twilio-conversations
cluster: twilio
description: "Unified: omnichannel SMS+WhatsApp+chat, conversation/participant/message management, webhooks"
tags: ["conversations","omnichannel","twilio"]
dependencies: []
composes: []
similar_to: []
called_by: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "twilio conversations omnichannel sms whatsapp chat unified participant"
---

# twilio-conversations

## Purpose
This skill provides tools for managing Twilio Conversations, enabling unified omnichannel communication across SMS, WhatsApp, and chat. It handles conversation creation, participant management, message sending, and webhook integrations for applications requiring seamless multi-channel interactions.

## When to Use
Use this skill when building apps that need to handle multiple channels in one system, such as customer support bots, messaging platforms, or notification services. Apply it for scenarios involving real-time messaging, like integrating SMS for alerts and WhatsApp for personalized responses, or when managing group chats with dynamic participants.

## Key Capabilities
- Create and manage conversations via the Twilio Conversations API, supporting channels like SMS, WhatsApp, and in-app chat.
- Add/remove participants using API calls, with options for attributes like role (e.g., "admin" or "participant").
- Send and receive messages with media support, including text, images, and files.
- Handle webhooks for events like message delivery or conversation updates, allowing real-time processing.
- Query conversation history and metadata using filters for date, participants, or channel.
- Support omnichannel routing, unifying messages from different sources into a single conversation object.

## Usage Patterns
Always initialize the Twilio client with authentication credentials from environment variables. For API interactions, use HTTP requests with JSON payloads. Pattern: Authenticate first, then perform CRUD operations on conversations. For webhooks, set up an endpoint to receive POST requests from Twilio. Use asynchronous patterns for message handling to avoid blocking. Example pattern: Fetch a conversation, add a participant, then send a message in sequence.

## Common Commands/API
Use the Twilio REST API for most operations. Set environment variables for auth: `$TWILIO_ACCOUNT_SID` and `$TWILIO_AUTH_TOKEN`. Base URL: `https://conversations.twilio.com/v1`.

- Create a conversation:
  ```
  curl -X POST "https://conversations.twilio.com/v1/Conversations" \
  -u $TWILIO_ACCOUNT_SID:$TWILIO_AUTH_TOKEN \
  -d "FriendlyName=MyChat"
  ```

- Add a participant to a conversation (SID: CHxxx):
  ```
  curl -X POST "https://conversations.twilio.com/v1/Conversations/CHxxx/Participants" \
  -u $TWILIO_ACCOUNT_SID:$TWILIO_AUTH_TOKEN \
  -d "Identity=user123"
  ```

- Send a message in a conversation (SID: CHxxx, Participant: MPxxx):
  ```
  curl -X POST "https://conversations.twilio.com/v1/Conversations/CHxxx/Messages" \
  -u $TWILIO_ACCOUNT_SID:$TWILIO_AUTH_TOKEN \
  -d "Author=MPxxx" -d "Body=Hello world"
  ```

- Fetch messages for a conversation (SID: CHxxx):
  ```
  curl -X GET "https://conversations.twilio.com/v1/Conversations/CHxxx/Messages" \
  -u $TWILIO_ACCOUNT_SID:$TWILIO_AUTH_TOKEN \
  -G -d "PageSize=50"
  ```

- Config format for webhooks: In Twilio Console, set webhook URL in conversation settings as JSON: `{"url": "https://yourapp.com/webhook", "method": "POST"}`. Use filters like `?OnMessageAdded=true` in API calls.

## Integration Notes
Integrate by including the Twilio Node.js SDK or equivalent in your project: `npm install twilio`. Authenticate using `const client = require('twilio')($TWILIO_ACCOUNT_SID, $TWILIO_AUTH_TOKEN);`. For omnichannel setup, ensure phone numbers are configured in Twilio for SMS/WhatsApp. Link conversations to other Twilio services like Studio for flows. When using webhooks, expose an HTTPS endpoint and validate requests with Twilio's signature: Check `X-Twilio-Signature` header. For multi-channel, specify the channel in API calls, e.g., add `channel=whatsapp` in participant creation.

## Error Handling
Always check HTTP status codes: 401 for auth failures (verify $TWILIO_ACCOUNT_SID and $TWILIO_AUTH_TOKEN); 404 for non-existent resources. Handle Twilio-specific errors by parsing the response body, e.g., if "code": 20404, resource not found. Use try-catch in code for API calls:
```
try {
  const conversation = await client.conversations.create({friendlyName: 'Test'});
} catch (error) {
  if (error.code === 20003) console.error('Rate limit exceeded; retry after delay');
}
```
Implement retry logic for transient errors (5xx codes) with exponential backoff. Log webhook errors by checking payload for issues like invalid JSON.

## Concrete Usage Examples
1. Create a new conversation and add a WhatsApp participant: First, use the API to create a conversation, then add a participant with WhatsApp identity. Code: `client.conversations.create().then(conv => client.conversations(conv.sid).participants.create({identity: 'user123', attributes: JSON.stringify({channel: 'whatsapp'})}));`. This unifies WhatsApp messages into the conversation for omnichannel tracking.

2. Send an SMS message in an existing conversation: Retrieve the conversation SID, then post a message. Example: `curl -X POST "https://conversations.twilio.com/v1/Conversations/CHxxx/Messages" -u $TWILIO_ACCOUNT_SID:$TWILIO_AUTH_TOKEN -d "Body=Alert: Your order is ready" -d "Attributes='{\"channel\":\"sms\"}'"`. Use this for notifications, ensuring the participant is linked to an SMS-capable number.

## Graph Relationships
- Related to cluster: twilio
- Related to tags: conversations, omnichannel, twilio
- Connected skills: twilio-messaging (for deeper message handling), twilio-webhooks (for event integrations)
