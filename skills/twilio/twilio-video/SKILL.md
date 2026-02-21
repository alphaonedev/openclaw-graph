---
name: twilio-video
cluster: twilio
description: "Video rooms: group/P2P, recording composition, track publication, network quality API, bandwidth"
tags: ["video","rooms","webrtc","twilio"]
dependencies: []
composes: []
similar_to: []
called_by: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "twilio video room participant recording webrtc bandwidth quality"
---

## Purpose

This skill enables interaction with Twilio's Video API for managing video rooms, including group or peer-to-peer (P2P) sessions, track handling, recording composition, and network quality monitoring. It focuses on WebRTC-based video communication for real-time applications.

## When to Use

Use this skill for scenarios requiring video collaboration, such as building video conferencing tools, live webinars, P2P calls, or apps needing bandwidth optimization. Apply it when you need to handle multiple participants, record sessions, or monitor network quality in production environments.

## Key Capabilities

- Create and manage video rooms (group or P2P) with options like unique names and max participants.
- Publish and subscribe to audio/video tracks using WebRTC, including muting or switching tracks.
- Compose recordings from room sessions, specifying formats (e.g., MP4) and layouts.
- Access network quality API for real-time metrics like bandwidth usage, packet loss, and jitter.
- Handle participant events, such as joining, leaving, or track updates, via WebSocket or API callbacks.

## Usage Patterns

1. Authenticate with Twilio credentials via environment variables (e.g., `$TWILIO_ACCOUNT_SID` and `$TWILIO_AUTH_TOKEN`), then initialize a client.
2. Create a room using the API, specifying type (e.g., "group") and options.
3. Have participants join by generating access tokens and connecting via the Twilio Video SDK.
4. Publish tracks (e.g., camera or screen share) and subscribe to others' tracks for real-time interaction.
5. Monitor network quality periodically and handle events like disconnections.
6. For recordings, start composition after room creation and retrieve via API polling.

Always validate inputs (e.g., room names) and handle asynchronous operations with promises or async/await in code.

## Common Commands/API

- Create a room: Use Twilio CLI: `twilio api:video:v1:rooms:create --unique-name my-room --type group --max-participants 4`
- Delete a room: Twilio CLI: `twilio api:video:v1:rooms:RMXXX:delete`
- API Endpoint for room creation: POST https://video.twilio.com/v1/Rooms with JSON body: `{"uniqueName": "my-room", "type": "group"}`
- Code snippet for publishing a track (Twilio JS SDK, 3 lines):
  ```javascript
  const room = await Twilio.Video.connect(token, {name: 'my-room'});
  const localTrack = new Twilio.Video.LocalVideoTrack({name: 'camera'});
  room.localParticipant.publishTrack(localTrack);
  ```
- Get network quality: API Endpoint: GET https://video.twilio.com/v1/Video/Rooms/RMXXX/Participants/PAXXX/NetworkQuality
- Code snippet for network stats (Twilio JS SDK, 2 lines):
  ```javascript
  const stats = room.localParticipant.getNetworkQuality();
  console.log(stats.score);  // e.g., 1-5 scale
  ```
- Start recording: API Endpoint: POST https://video.twilio.com/v1/Video/Rooms/RMXXX/Recordings with body: `{"roomSid": "RMXXX"}`
- Config format for room creation: JSON object like `{"uniqueName": "session-123", "type": "peer-to-peer", "enableTurn": true}` in API requests.

## Integration Notes

- Authentication: Always use environment variables for keys, e.g., `export TWILIO_ACCOUNT_SID=ACxxx` and `export TWILIO_AUTH_TOKEN=your-token`. Initialize clients like: `const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);`
- Integrate with web apps: Include the Twilio Video SDK via script tag: `<script src="https://sdk.twilio.com/js/video/releases/2.15.0/twilio-video.min.js"></script>`, then use it to connect rooms.
- Server-side integration: Use Twilio's Node.js library for REST calls; for other languages, use HTTP clients with the base URL `https://video.twilio.com/v1`.
- WebRTC specifics: Ensure your app handles ICE candidates and STUN/TURN servers; configure via Twilio dashboard or pass options like `{iceServers: [...]}` in SDK connect calls.
- Bandwidth management: Set profile via API (e.g., POST /v1/Video/Profiles with `{"name": "low-bandwidth", "maxSubscriptionBitrate": 500000}`) to limit usage.

## Error Handling

- Common errors: 401 Unauthorized – Verify `$TWILIO_AUTH_TOKEN` and retry; 404 Not Found – Check room SID and use fallback logic; 429 Too Many Requests – Implement exponential backoff.
- Handle WebRTC errors: For connection issues, catch events like 'disconnected' in SDK and log details (e.g., iceConnectionState).
- Code snippet for error handling (2 lines):
  ```javascript
  try {
    await client.video.v1.rooms('RMXXX').fetch();
  } catch (error) {
    if (error.status === 404) console.error('Room not found; create a new one');
  }
  ```
- Best practices: Use try-catch for all API calls, log error codes and messages, and implement retries for transient errors (e.g., network failures) with a limit of 3 attempts.

## Concrete Usage Examples

1. **Create and Join a Group Video Room:**
   - Step 1: Authenticate and create the room via CLI: `twilio api:video:v1:rooms:create --unique-name team-meeting --type group`
   - Step 2: Generate an access token on your server for a participant.
   - Step 3: In client-side code, connect and publish: 
     ```javascript
     Twilio.Video.connect(accessToken, {name: 'team-meeting'}).then(room => {
       room.localParticipant.publishTrack(new Twilio.Video.LocalAudioTrack());
     });
     ```
   - This pattern ensures participants can join, publish audio, and handle up to the max set (e.g., 4).

2. **Record and Compose a Video Session:**
   - Step 1: Create a room and start recording via API: `curl -X POST "https://video.twilio.com/v1/Video/Rooms/RMXXX/Recordings" -u $TWILIO_ACCOUNT_SID:$TWILIO_AUTH_TOKEN -d '{"roomSid": "RMXXX"}'`
   - Step 2: After the session, compose the recording: Use endpoint POST https://video.twilio.com/v1/Compositions with body `{"roomSid": "RMXXX", "audioSources": "*"}`
   - Step 3: Retrieve the composed file: GET https://video.twilio.com/v1/Compositions/{Sid}/Media
   - This example records all tracks and outputs a single MP4 file for archiving.

## Graph Relationships

- Related to: twilio-voice (for integrating video with voice calls in unified communication apps)
- Part of cluster: twilio (shares authentication and core APIs with other Twilio skills)
- Links to: webrtc (for low-level WebRTC handling) and bandwidth-optimization skills (for network quality monitoring)
