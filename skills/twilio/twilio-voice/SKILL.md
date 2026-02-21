---
name: twilio-voice
cluster: twilio
description: "Voice: outbound/inbound, TwiML, conferencing, recording, transcription, IVR Gather, SIP, BYOC"
tags: ["voice","calls","twiml","ivr","twilio"]
dependencies: []
composes: []
similar_to: []
called_by: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "twilio voice call outbound inbound twiml ivr conference record sip"
---

# twilio-voice

## Purpose
This skill handles Twilio Voice capabilities, enabling programmatic management of voice calls, including outbound and inbound routing, TwiML for call logic, conferencing, recording, transcription, IVR interactions, SIP trunking, and BYOC setups. It's designed for integrating voice communications into applications.

## When to Use
Use this skill for scenarios requiring real-time voice interactions, such as building IVR systems for customer support, automating outbound notifications, setting up conference calls, or integrating SIP with existing telecom infrastructure. Apply it when you need to process voice data like transcriptions or recordings in code.

## Key Capabilities
- Outbound calls: Initiate calls via API to any phone number.
- Inbound calls: Handle incoming calls with webhooks and TwiML.
- TwiML: Define call flows using XML for IVR, menus, or transfers.
- Conferencing: Create and manage voice conferences with participant controls.
- Recording and Transcription: Automatically record calls and transcribe audio to text.
- IVR Gather: Collect user input via DTMF or speech.
- SIP and BYOC: Route calls over SIP or bring your own carrier for custom routing.
- Specifics: Use Twilio's REST API for all operations; e.g., endpoint for calls is `POST /2010-04-01/Accounts/{AccountSid}/Calls.json`.

## Usage Patterns
To use this skill, first authenticate with Twilio credentials stored in environment variables like `$TWILIO_ACCOUNT_SID` and `$TWILIO_AUTH_TOKEN`. Initialize the Twilio client in your code, then perform actions like making calls or setting up webhooks. For TwiML, create a server endpoint to respond with XML. Always handle asynchronous responses, such as webhooks for call status updates. Pattern: Authenticate -> Build request -> Execute API call -> Process response.

## Common Commands/API
- Make an outbound call: Use Twilio's REST API. Endpoint: `POST https://api.twilio.com/2010-04-01/Accounts/{AccountSid}/Calls.json` with parameters like `To`, `From`, and `Url` for TwiML.
  ```python
  from twilio.rest import Client
  client = Client($TWILIO_ACCOUNT_SID, $TWILIO_AUTH_TOKEN)
  call = client.calls.create(to='recipient-number', from_='your-twilio-number', url='https://your-server/twiml')
  ```
- Handle inbound calls: Set up a webhook on your Twilio phone number to point to an endpoint that returns TwiML, e.g., `https://your-server/inbound`.
  ```xml
  <Response>
    <Say>Hello, this is your IVR.</Say>
    <Gather action="/handle-input" numDigits="1">
      <Say>Press 1 for support.</Say>
    </Gather>
  </Response>
  ```
- Start a conference: API endpoint: `POST /2010-04-01/Accounts/{AccountSid}/Conferences.json`. Include parameters like `FriendlyName`.
  ```python
  conference = client.conferences.create(friendly_name='MyConference')
  ```
- Record a call: Add `<Record>` to TwiML or use API flag in call creation, e.g., add `record=true` to the calls.create method.
- Transcribe audio: Enable via TwiML with `<Record transcribe="true" />` and retrieve transcript via `GET /2010-04-01/Accounts/{AccountSid}/Recordings/{Sid}/Transcription.json`.
- Common CLI flags: If using Twilio CLI, commands like `twilio phone-numbers:update --sid=PNxxx --voice-url=https://your-server/twiml` for updating webhooks.

## Integration Notes
Integrate by including the Twilio Python library (install via `pip install twilio`). For webhooks, ensure your server is publicly accessible and uses HTTPS. Config format: Store credentials in a `.env` file like `TWILIO_ACCOUNT_SID=ACxxx` and load with `os.environ`. For SIP, configure in Twilio Console under "SIP Domain" and use API to route calls. When combining with other services, map Twilio events to your app's logic, e.g., send transcriptions to a database via webhook handlers. Always validate incoming requests with Twilio's signature for security.

## Error Handling
Common errors include authentication failures (HTTP 401) from invalid `$TWILIO_ACCOUNT_SID` or `$TWILIO_AUTH_TOKEN`—check and retry with correct values. Rate limit errors (HTTP 429) require implementing exponential backoff. For call failures, parse API responses for codes like 13224 (invalid number) and log details. In code, wrap API calls in try-except blocks:
  ```python
  try:
      call = client.calls.create(...)
  except TwilioException as e:
      if e.code == 21614:  # Authentication error
          print("Invalid credentials; check env vars")
      else:
          raise
  ```
Handle webhook timeouts by setting appropriate TwiML timeouts. Always check for null responses in transcriptions or recordings.

## Concrete Usage Examples
1. **Outbound Call for Notifications**: To send a voice alert, authenticate with env vars, then use the calls.create method. Example: In a script, call a user to read a message: `client.calls.create(to='+1234567890', from_='+0987654321', url='https://your-server/message-twiml')`, where the TwiML endpoint responds with `<Response><Say>Your appointment is confirmed.</Say></Response>`.
2. **IVR for Customer Support**: Set up an inbound number with a webhook. When a call comes in, the endpoint returns TwiML to gather input: `POST to your server with <Gather>`, then handle the action URL to route to agents based on digits pressed, e.g., if digit=1, transfer via `<Dial><Number>agent-extension</Number></Dial>`.

## Graph Relationships
- Related to: twilio-messaging (for combined voice-SMS workflows), twilio-video (for extending to video calls), general twilio cluster for shared authentication.
- Dependencies: Requires twilio-api for core functionality; can link with external services like sip-trunking or byoc setups.
