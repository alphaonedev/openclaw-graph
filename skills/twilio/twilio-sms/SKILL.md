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

Enable OpenClaw to implement and operate Twilio Programmable Messaging (SMS/MMS) in production:

- Send SMS/MMS reliably (Messaging Services, geo-matching, sticky sender, media constraints).
- Receive inbound messages via webhooks and respond with TwiML.
- Track delivery lifecycle via status callbacks (queued/sent/delivered/undelivered/failed).
- Implement opt-out/STOP compliance and keyword workflows.
- Operate A2P 10DLC (US long code) and toll-free verification constraints.
- Debug and harden: signature validation, retries, idempotency, rate limits, carrier errors.

This skill is for engineers building messaging pipelines, customer notifications, 2-way support, and compliance-sensitive messaging.

---

## Prerequisites

### Accounts & Twilio Console setup

- Twilio account with **Programmable Messaging** enabled.
- At least one of:
  - **Messaging Service** (recommended) with sender pool (long codes / toll-free / short code).
  - A dedicated **Phone Number** capable of SMS/MMS.
- For US A2P 10DLC:
  - Brand + Campaign registration completed in Twilio Console (Messaging → Regulatory Compliance / A2P 10DLC).
- For toll-free:
  - Toll-free verification submitted/approved if sending high volume to US/CA.

### Runtime versions (tested)

- Node.js **20.11.1** (LTS) + npm **10.2.4**
- Python **3.11.7**
- Twilio SDKs:
  - `twilio` (Node) **4.23.0**
  - `twilio` (Python) **9.4.1**
- Web framework examples:
  - Express **4.18.3**
  - FastAPI **0.109.2** + Uvicorn **0.27.1**
- Optional tooling:
  - Twilio CLI **5.16.0**
  - ngrok **3.13.1** (local webhook tunneling)
  - Docker **25.0.3** + Compose v2 **2.24.6**

### Credentials & auth

You need:

- `TWILIO_ACCOUNT_SID` (starts with `AC...`)
- `TWILIO_AUTH_TOKEN`
- One of:
  - `TWILIO_MESSAGING_SERVICE_SID` (starts with `MG...`) **preferred**
  - `TWILIO_FROM_NUMBER` (E.164, e.g. `+14155552671`)

Store secrets in a secret manager (AWS Secrets Manager / GCP Secret Manager / Vault). For local dev, `.env` is acceptable.

### Network & webhook requirements

- Public HTTPS endpoint for inbound and status callbacks.
- Must accept `application/x-www-form-urlencoded` (Twilio default) and/or JSON depending on endpoint.
- Validate Twilio signatures (`X-Twilio-Signature`) on inbound webhooks.

---

## Core Concepts

### Programmable Messaging objects

- **Message**: a single outbound or inbound SMS/MMS. Identified by `MessageSid` (`SM...`).
- **Messaging Service**: abstraction over senders; supports:
  - sender pool
  - geo-matching
  - sticky sender
  - smart encoding
  - status callback configuration
- **Status Callback**: webhook invoked as message state changes.
- **Inbound Webhook**: webhook invoked when Twilio receives an inbound message to your number/service.

### Delivery lifecycle (practical)

Typical `MessageStatus` values you will see:

- `queued` → `sending` → `sent` → `delivered`
- Failure paths:
  - `undelivered` (carrier rejected / unreachable)
  - `failed` (Twilio could not send; configuration/auth issues)

Treat `sent` as “handed to carrier”, not “delivered”.

### TwiML for Messaging

Inbound SMS/MMS webhooks can respond with TwiML:

```xml
<Response>
  <Message>Thanks. We received your message.</Message>
</Response>
```

Use TwiML for synchronous replies; use REST API for async workflows.

### Opt-out compliance

- Twilio automatically handles standard opt-out keywords (e.g., `STOP`, `UNSUBSCRIBE`).
- When a user opts out, Twilio blocks further messages from that sender/service to that recipient until they opt back in (`START`).
- Your app should:
  - treat opt-out as a first-class state
  - avoid retry storms on blocked recipients
  - log and suppress sends to opted-out numbers

### A2P 10DLC / short codes / toll-free

- **US A2P 10DLC**: required for application-to-person messaging over US long codes at scale. Unregistered traffic may be filtered or blocked.
- **Short codes**: high throughput, expensive, long provisioning.
- **Toll-free**: good for US/CA; verification improves deliverability and throughput.

### Webhook retries and idempotency

Twilio retries webhooks on non-2xx responses. Your webhook handlers must be:

- idempotent (dedupe by `MessageSid` / `SmsSid`)
- fast (respond quickly; enqueue work)
- resilient (return 2xx once accepted)

---

## Installation & Setup

### Official Python SDK — Messaging

**Repository:** https://github.com/twilio/twilio-python  
**PyPI:** `pip install twilio` · **Supported:** Python 3.7–3.13

```python
from twilio.rest import Client
client = Client()  # TWILIO_ACCOUNT_SID + TWILIO_AUTH_TOKEN from env

# Send SMS
msg = client.messages.create(
    body="Hello from Python!",
    from_="+15017250604",
    to="+15558675309"
)
print(msg.sid)

# List recent messages
for m in client.messages.list(limit=20):
    print(m.body, m.status)
```

Source: [twilio/twilio-python — messages](https://github.com/twilio/twilio-python/blob/main/twilio/rest/api/v2010/account/message/__init__.py)

### Ubuntu 22.04 (x86_64 / ARM64)

```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg jq
```

Node.js 20 via NodeSource:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node -v   # v20.11.1 (or later 20.x)
npm -v    # 10.2.4 (or later)
```

Python 3.11:

```bash
sudo apt-get install -y python3.11 python3.11-venv python3-pip
python3.11 --version
```

Twilio CLI 5.16.0:

```bash
npm install -g twilio-cli@5.16.0
twilio --version
```

ngrok 3.13.1 (optional):

```bash
curl -fsSL https://ngrok-agent.s3.amazonaws.com/ngrok.asc \
  | sudo gpg --dearmor -o /usr/share/keyrings/ngrok.gpg
echo "deb [signed-by=/usr/share/keyrings/ngrok.gpg] https://ngrok-agent.s3.amazonaws.com buster main" \
  | sudo tee /etc/apt/sources.list.d/ngrok.list
sudo apt-get update && sudo apt-get install -y ngrok
ngrok version
```

### Fedora 39 (x86_64 / ARM64)

```bash
sudo dnf install -y curl jq nodejs python3.11 python3.11-pip
node -v
python3.11 --version
```

Twilio CLI:

```bash
sudo npm install -g twilio-cli@5.16.0
twilio --version
```

### macOS (Intel + Apple Silicon)

Homebrew:

```bash
brew update
brew install node@20 python@3.11 jq
```

Ensure PATH:

```bash
echo 'export PATH="/opt/homebrew/opt/node@20/bin:/opt/homebrew/opt/python@3.11/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
node -v
python3.11 --version
```

Twilio CLI:

```bash
npm install -g twilio-cli@5.16.0
twilio --version
```

ngrok:

```bash
brew install ngrok/ngrok/ngrok
ngrok version
```

### Docker (all platforms)

```bash
docker --version
docker compose version
```

### Twilio CLI authentication

Interactive login:

```bash
twilio login
```

Or set env vars (CI):

```bash
export TWILIO_ACCOUNT_SID="YOUR_ACCOUNT_SID"
export TWILIO_AUTH_TOKEN="your_auth_token"
```

Verify:

```bash
twilio api:core:accounts:fetch --sid "$TWILIO_ACCOUNT_SID"
```

### Local webhook tunneling (ngrok)

```bash
ngrok http 3000
# note the https forwarding URL, e.g. https://f3a1-203-0-113-10.ngrok-free.app
```

Configure Twilio inbound webhook to:

- `https://.../twilio/inbound`
- Status callback to:
  - `https://.../twilio/status`

---

## Key Capabilities

### Send SMS/MMS (REST API)

- Use Messaging Service (`messagingServiceSid`) for production.
- Use `statusCallback` for delivery receipts.
- Use `provideFeedback=true` for carrier feedback (where supported).

Node (SMS):

```javascript
import twilio from "twilio";

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const msg = await client.messages.create({
  messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID,
  to: "+14155550123",
  body: "Build 742 deployed. Reply STOP to opt out.",
  statusCallback: "https://api.example.com/twilio/status",
  provideFeedback: true,
});

console.log(msg.sid, msg.status);
```

Python (MMS):

```python
from twilio.rest import Client
import os

client = Client(os.environ["TWILIO_ACCOUNT_SID"], os.environ["TWILIO_AUTH_TOKEN"])

msg = client.messages.create(
    messaging_service_sid=os.environ["TWILIO_MESSAGING_SERVICE_SID"],
    to="+14155550123",
    body="Here is the incident screenshot.",
    media_url=["https://cdn.example.com/incidents/INC-2048.png"],
    status_callback="https://api.example.com/twilio/status",
)
print(msg.sid, msg.status)
```

Production constraints for MMS:

- Media must be publicly reachable via HTTPS.
- Content-type and size limits vary by carrier; keep images small (< 500KB) when possible.
- Use signed URLs with sufficient TTL (>= 1 hour) if private.

---

### Receive inbound SMS/MMS (webhook)

Inbound webhook receives form-encoded fields like:

- `From`, `To`, `Body`
- `MessageSid` (or `SmsSid` legacy)
- `NumMedia`, `MediaUrl0`, `MediaContentType0`, ...

Express handler with signature validation:

```javascript
import express from "express";
import twilio from "twilio";

const app = express();

// Twilio sends application/x-www-form-urlencoded by default
app.use(express.urlencoded({ extended: false }));

app.post("/twilio/inbound", (req, res) => {
  const signature = req.header("X-Twilio-Signature") || "";
  const url = "https://api.example.com/twilio/inbound"; // must match public URL exactly

  const isValid = twilio.validateRequest(
    process.env.TWILIO_AUTH_TOKEN,
    signature,
    url,
    req.body
  );

  if (!isValid) {
    return res.status(403).send("Invalid signature");
  }

  const from = req.body.From;
  const body = (req.body.Body || "").trim();

  // Fast path: respond immediately; enqueue work elsewhere
  const twiml = new twilio.twiml.MessagingResponse();
  if (body.toUpperCase() === "HELP") {
    twiml.message("Support: https://status.example.com. Reply STOP to opt out.");
  } else {
    twiml.message("Received. Ticket created.");
  }

  res.type("text/xml").send(twiml.toString());
});

app.listen(3000);
```

FastAPI handler:

```python
from fastapi import FastAPI, Request, Response
from twilio.request_validator import RequestValidator
from twilio.twiml.messaging_response import MessagingResponse
import os

app = FastAPI()
validator = RequestValidator(os.environ["TWILIO_AUTH_TOKEN"])

@app.post("/twilio/inbound")
async def inbound(request: Request):
    form = await request.form()
    signature = request.headers.get("X-Twilio-Signature", "")
    url = "https://api.example.com/twilio/inbound"

    if not validator.validate(url, dict(form), signature):
        return Response("Invalid signature", status_code=403)

    body = (form.get("Body") or "").strip()
    resp = MessagingResponse()
    resp.message("Received.")
    return Response(str(resp), media_type="text/xml")
```

---

### Delivery receipts (status callback webhook)

Status callback receives:

- `MessageSid`
- `MessageStatus` (`queued`, `sent`, `delivered`, `undelivered`, `failed`)
- `To`, `From`
- `ErrorCode` (e.g., `30003`)
- `ErrorMessage` (sometimes present)

Express:

```javascript
app.post("/twilio/status", express.urlencoded({ extended: false }), async (req, res) => {
  // Validate signature same as inbound; use exact public URL
  const messageSid = req.body.MessageSid;
  const status = req.body.MessageStatus;
  const errorCode = req.body.ErrorCode ? Number(req.body.ErrorCode) : null;

  // Idempotency: upsert by messageSid + status
  // Example: write to DB with unique constraint (messageSid, status)
  console.log({ messageSid, status, errorCode });

  res.status(204).send();
});
```

Operational guidance:

- Treat callbacks as at-least-once delivery.
- Persist state transitions; do not assume ordering.
- Use callbacks to:
  - mark notifications delivered
  - trigger fallback channels (email/push) on `undelivered`/`failed`
  - compute deliverability metrics by carrier/region

---

### Opt-out / STOP handling

Twilio blocks messages to opted-out recipients automatically. Your system should:

- Detect opt-out keywords on inbound messages and update your own contact preferences.
- Suppress sends to opted-out recipients to avoid repeated 21610 errors.

Inbound keyword handling:

```javascript
const normalized = body.trim().toUpperCase();
const isStop = ["STOP", "STOPALL", "UNSUBSCRIBE", "CANCEL", "END", "QUIT"].includes(normalized);
const isStart = ["START", "YES", "UNSTOP"].includes(normalized);

if (isStop) {
  // mark user opted out in your DB
}
if (isStart) {
  // mark user opted in
}
```

When sending, pre-check your DB opt-out state. If you still hit Twilio block, handle error code `21610`.

---

### Messaging Services: sender pools, geo-matching, sticky sender

Use a Messaging Service to:

- avoid hardcoding `From`
- rotate senders safely
- enable geo-matching (local presence)
- enable sticky sender (consistent From per recipient)

Create a service (CLI):

```bash
twilio api:messaging:v1:services:create \
  --friendly-name "prod-notifications" \
  --status-callback "https://api.example.com/twilio/status"
```

Add a phone number to the service:

```bash
twilio api:messaging:v1:services:phone-numbers:create \
  --service-sid YOUR_MG_SID \
  --phone-number-sid PN0123456789abcdef0123456789abcdef
```

Enable sticky sender / geo-match (via API; CLI coverage varies by version):

```bash
twilio api:messaging:v1:services:update \
  --sid YOUR_MG_SID \
  --sticky-sender true \
  --area-code-geomatch true
```

---

### A2P 10DLC operational checks (US)

What to enforce in code:

- If sending to US numbers (`+1...`) from US long codes:
  - ensure the sender is associated with an approved A2P campaign
  - ensure message content matches campaign use case (avoid content drift)
- Monitor filtering:
  - rising `30003`/`30005` and `undelivered` rates
  - carrier violations and spam flags

Twilio Console is the source of truth for registration state; in CI/CD, treat campaign IDs and service SIDs as config.

---

### Short codes and toll-free

- Short code: high throughput, best deliverability; long lead time.
- Toll-free: good for US/CA; verification required for scale.

Implementation is identical at API level; difference is provisioning and compliance.

---

### Webhook security: signature validation and URL correctness

Signature validation is brittle if:

- you validate against the wrong URL (must match the public URL Twilio used)
- you have proxies altering scheme/host
- you parse body differently than Twilio expects

If behind a reverse proxy (ALB/NGINX), reconstruct the public URL using forwarded headers carefully, or hardcode the known public URL per route.

---

## Command Reference

### Twilio CLI (5.16.0)

#### Authentication / environment

```bash
twilio login
twilio profiles:list
twilio profiles:use <profile>
```

Set env vars for a single command:

```bash
TWILIO_ACCOUNT_SID=AC... TWILIO_AUTH_TOKEN=... twilio api:core:accounts:fetch --sid AC...
```

#### Send a message (CLI)

Twilio CLI has a `twilio api:core:messages:create` command (core API). Common flags:

```bash
twilio api:core:messages:create \
  --to "+14155550123" \
  --from "+14155552671" \
  --body "Deploy complete." \
  --status-callback "https://api.example.com/twilio/status" \
  --provide-feedback true \
  --max-price 0.015 \
  --application-sid AP0123456789abcdef0123456789abcdef
```

Notes on flags:

- `--to` (required): destination E.164.
- `--from`: sender number (E.164). Prefer Messaging Service instead.
- `--messaging-service-sid MG...`: use service; mutually exclusive with `--from`.
- `--body`: SMS text.
- `--media-url`: repeatable; MMS media URL(s).
- `--status-callback`: webhook for status updates.
- `--provide-feedback`: request carrier feedback (not always available).
- `--max-price`: cap price (USD) for message; may cause failures if too low.
- `--application-sid`: for TwiML app association (rare for Messaging).

MMS example:

```bash
twilio api:core:messages:create \
  --to "+14155550123" \
  --messaging-service-sid YOUR_MG_SID \
  --body "Photo" \
  --media-url "https://cdn.example.com/a.png" \
  --media-url "https://cdn.example.com/b.jpg"
```

Fetch message:

```bash
twilio api:core:messages:fetch --sid SM0123456789abcdef0123456789abcdef
```

List messages (filters vary; core ones):

```bash
twilio api:core:messages:list --limit 50
twilio api:core:messages:list --to "+14155550123" --limit 20
twilio api:core:messages:list --from "+14155552671" --limit 20
```

Delete message record (rare; mostly for cleanup/testing):

```bash
twilio api:core:messages:remove --sid SM0123456789abcdef0123456789abcdef
```

#### Messaging Services

Create:

```bash
twilio api:messaging:v1:services:create \
  --friendly-name "prod-notifications" \
  --status-callback "https://api.example.com/twilio/status"
```

Update:

```bash
twilio api:messaging:v1:services:update \
  --sid YOUR_MG_SID \
  --friendly-name "prod-notifications" \
  --status-callback "https://api.example.com/twilio/status" \
  --inbound-request-url "https://api.example.com/twilio/inbound" \
  --inbound-method POST
```

List:

```bash
twilio api:messaging:v1:services:list --limit 50
```

Fetch:

```bash
twilio api:messaging:v1:services:fetch --sid YOUR_MG_SID
```

Phone numbers attached to a service:

```bash
twilio api:messaging:v1:services:phone-numbers:list \
  --service-sid YOUR_MG_SID \
  --limit 50
```

Attach a number:

```bash
twilio api:messaging:v1:services:phone-numbers:create \
  --service-sid YOUR_MG_SID \
  --phone-number-sid PN0123456789abcdef0123456789abcdef
```

Remove a number from service:

```bash
twilio api:messaging:v1:services:phone-numbers:remove \
  --service-sid YOUR_MG_SID \
  --sid PN0123456789abcdef0123456789abcdef
```

#### Incoming phone numbers (to find PN SIDs)

List numbers:

```bash
twilio api:core:incoming-phone-numbers:list --limit 50
```

Fetch:

```bash
twilio api:core:incoming-phone-numbers:fetch --sid PN0123456789abcdef0123456789abcdef
```

Update webhook on a number (if not using Messaging Service inbound URL):

```bash
twilio api:core:incoming-phone-numbers:update \
  --sid PN0123456789abcdef0123456789abcdef \
  --sms-url "https://api.example.com/twilio/inbound" \
  --sms-method POST \
  --sms-fallback-url "https://api.example.com/twilio/fallback" \
  --sms-fallback-method POST \
  --status-callback "https://api.example.com/twilio/status"
```

---

## Configuration Reference

### Environment variables

Recommended variables:

- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_MESSAGING_SERVICE_SID` (preferred)
- `TWILIO_FROM_NUMBER` (only if not using service)
- `TWILIO_STATUS_CALLBACK_URL`
- `TWILIO_INBOUND_WEBHOOK_PUBLIC_URL` (for signature validation)

#### Node.js `.env`

Path: `/srv/app/.env` (Linux) or project root for local dev.

```dotenv
TWILIO_ACCOUNT_SID=YOUR_ACCOUNT_SID
TWILIO_AUTH_TOKEN=0123456789abcdef0123456789abcdef
TWILIO_MESSAGING_SERVICE_SID=YOUR_MG_SID
TWILIO_STATUS_CALLBACK_URL=https://api.example.com/twilio/status
TWILIO_INBOUND_WEBHOOK_PUBLIC_URL=https://api.example.com/twilio/inbound
```

Load with `dotenv`:

```bash
npm install dotenv@16.4.5
```

```javascript
import "dotenv/config";
```

#### systemd unit (production)

Path: `/etc/systemd/system/messaging-api.service`

```ini
[Unit]
Description=Messaging API
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=messaging
Group=messaging
WorkingDirectory=/srv/messaging-api
EnvironmentFile=/etc/messaging-api/env
ExecStart=/usr/bin/node /srv/messaging-api/dist/server.js
Restart=on-failure
RestartSec=2
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/srv/messaging-api /var/log/messaging-api
AmbientCapabilities=
CapabilityBoundingSet=

[Install]
WantedBy=multi-user.target
```

Secrets file path: `/etc/messaging-api/env` (chmod 600)

```bash
sudo install -m 600 -o root -g root /dev/null /etc/messaging-api/env
```

Example `/etc/messaging-api/env`:

```bash
TWILIO_ACCOUNT_SID=YOUR_ACCOUNT_SID
TWILIO_AUTH_TOKEN=0123456789abcdef0123456789abcdef
TWILIO_MESSAGING_SERVICE_SID=YOUR_MG_SID
TWILIO_STATUS_CALLBACK_URL=https://api.example.com/twilio/status
TWILIO_INBOUND_WEBHOOK_PUBLIC_URL=https://api.example.com/twilio/inbound
PORT=3000
```

#### NGINX reverse proxy (webhook endpoints)

Path: `/etc/nginx/conf.d/messaging-api.conf`

```nginx
server {
  listen 443 ssl http2;
  server_name api.example.com;

  ssl_certificate     /etc/letsencrypt/live/api.example.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/api.example.com/privkey.pem;

  location /twilio/ {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_read_timeout 10s;
  }
}
```

Important: signature validation depends on the URL Twilio used; ensure your app uses the external URL, not `http://127.0.0.1`.

---

## Integration Patterns

### Pattern: Outbound notifications with delivery-driven fallback

Pipeline:

1. Send SMS with `statusCallback`.
2. On callback:
   - if `delivered`: mark success.
   - if `undelivered`/`failed`: enqueue email via SendGrid or push notification.

Pseudo-architecture:

- API service: accepts “notify user” request.
- Queue: stores send jobs.
- Worker: sends Twilio message.
- Webhook service: processes status callbacks and triggers fallback.

Example (status callback → SQS):

```javascript
// on /twilio/status
if (status === "undelivered" || status === "failed") {
  await sqs.sendMessage({
    QueueUrl: process.env.FALLBACK_QUEUE_URL,
    MessageBody: JSON.stringify({ messageSid, to: req.body.To, reason: req.body.ErrorCode }),
  });
}
```

### Pattern: Two-way support with ticketing

Inbound SMS:

- Validate signature.
- Normalize sender (`From`) and map to customer.
- Create ticket in Jira/ServiceNow/Zendesk.
- Reply with ticket ID via TwiML.

Example TwiML reply:

```xml
<Response>
  <Message>Your ticket INC-2048 is open. Reply HELP for options.</Message>
</Response>
```

### Pattern: Keyword-based workflows (HELP/STOP/START + custom)

- `HELP`: return support URL and contact.
- `STOP`: update internal preference store (Twilio also blocks).
- Custom keywords: `STATUS <id>`, `ONCALL`, `ACK <incident>`.

Ensure parsing is robust and case-insensitive; log raw inbound payload for audit.

### Pattern: Multi-region sending with geo-matching

- Use a single Messaging Service with:
  - sender pool across regions
  - geo-matching enabled
- For compliance, route by recipient country:
  - US/CA: toll-free or A2P 10DLC long code
  - UK: alphanumeric sender ID (if supported) or local number
  - India: DLT constraints (outside scope here; treat as separate compliance module)

### Pattern: Idempotent send API

If your upstream retries, you must avoid duplicate SMS.

Approach:

- Accept `idempotencyKey` from caller.
- Store mapping `idempotencyKey -> MessageSid`.
- If key exists, return existing `MessageSid`.

Example DB constraint:

- Unique index on `idempotency_key`.

---

## Error Handling & Troubleshooting

Handle errors at two layers:

- REST API call errors (synchronous)
- Status callback errors (asynchronous delivery failures)

Below are common Twilio errors with root cause and fix.

### 1) 21211 — invalid `To` number

Error text (typical):

`Twilio could not find a Channel with the specified From address`

or:

`The 'To' number +1415555 is not a valid phone number.`

Root causes:

- Not E.164 formatted.
- Contains spaces/parentheses.
- Invalid country code.

Fix:

- Normalize to E.164 before sending.
- Validate with libphonenumber.
- Reject at API boundary with clear error.

### 2) 20003 — authentication error

Error text:

`Authenticate`

or:

`Unable to create record: Authenticate`

Root causes:

- Wrong `TWILIO_AUTH_TOKEN`.
- Using test credentials against live endpoint or vice versa.
- Account SID mismatch.

Fix:

- Verify env vars in runtime.
- Rotate token if leaked.
- In CI, ensure correct secret scope.

### 3) 20429 — rate limit exceeded

Error text:

`Too Many Requests`

Root causes:

- Bursty sends exceeding Twilio or Messaging Service limits.
- Excessive API polling.

Fix:

- Implement client-side rate limiting and backoff (exponential with jitter).
- Batch sends via queue workers.
- Use Messaging Service / short code for higher throughput.

### 4) 21610 — recipient opted out

Error text:

`The message From/To pair violates a blacklist rule.`

Root causes:

- Recipient replied STOP (or carrier-level block).
- Your system keeps retrying.

Fix:

- Suppress sends to opted-out recipients in your DB.
- Provide opt-in flow (START).
- Do not retry 21610; treat as terminal.

### 5) 30003 — Unreachable destination handset / carrier violation

Error text (common):

`Unreachable destination handset`

Root causes:

- Device off/out of coverage.
- Carrier filtering.
- Invalid or deactivated number.

Fix:

- Treat as non-retryable after limited attempts.
- Trigger fallback channel.
- Monitor spikes by carrier/country; check A2P registration and content.

### 6) 30005 — Unknown destination handset

Error text:

`Unknown destination handset`

Root causes:

- Number not assigned.
- Porting issues.

Fix:

- Mark number invalid after repeated failures.
- Ask user to update phone number.

### 7) 21614 — 'To' is not a valid mobile number (MMS)

Error text:

`'To' number is not a valid mobile number`

Root causes:

- Attempting MMS to a number/carrier that doesn’t support MMS.
- Landline.

Fix:

- Detect MMS capability; fallback to SMS with link.
- Use Lookup (Twilio Lookup API) if you must preflight (cost tradeoff).

### 8) 21606 — From number not capable of sending SMS

Error text:

`The From phone number +14155552671 is not a valid, SMS-capable inbound phone number or short code for your account.`

Root causes:

- Using a voice-only number.
- Number not owned by your account.
- Wrong sender configured.

Fix:

- Use Messaging Service with verified senders.
- Confirm number capabilities in Console or via IncomingPhoneNumbers API.

### 9) Webhook signature failures (your logs)

Typical app log:

`Invalid signature`

Root causes:

- Validating against wrong URL (http vs https, host mismatch, path mismatch).
- Proxy rewrites.
- Body parsing differences.

Fix:

- Validate against the exact public URL configured in Twilio.
- Ensure `express.urlencoded()` is used for form payloads.
- If behind proxy, set `app.set('trust proxy', true)` and reconstruct URL carefully.

### 10) Status callback not firing

Symptoms:

- Message shows delivered in console but your system never receives callback.

Root causes:

- `statusCallback` not set on message or service.
- Callback URL returns non-2xx; Twilio retries then gives up.
- Firewall blocks Twilio IPs (don’t IP allowlist unless you maintain Twilio ranges).

Fix:

- Set status callback at Messaging Service level.
- Ensure endpoint returns 2xx quickly.
- Log request bodies and response codes; add metrics.

---

## Security Hardening

### Secrets handling

- Do not store `TWILIO_AUTH_TOKEN` in repo.
- Use secret manager + short-lived deployment injection.
- Rotate tokens on incident; treat as high-impact credential.

### Webhook validation (mandatory)

- Validate `X-Twilio-Signature` for inbound and status callbacks.
- Reject invalid signatures with 403.
- Log minimal metadata; avoid logging full message bodies if sensitive.

### TLS and transport

- Enforce HTTPS for all webhook endpoints.
- Disable TLS 1.0/1.1; prefer TLS 1.2+.
- If using NGINX, follow CIS NGINX Benchmark guidance for strong ciphers (adapt to your org baseline).

### Request handling

- Limit request body size (protect against abuse):
  - Express: `express.urlencoded({ limit: "64kb", extended: false })`
- Apply rate limiting on webhook endpoints (careful: Twilio retries; don’t block legitimate retries).
- Use WAF rules to block obvious abuse, but do not rely on IP allowlists.

### Data minimization

- Store only what you need:
  - `MessageSid`, `To`, `From`, timestamps, status, error codes
- If storing message content, encrypt at rest and restrict access.

### OS/service hardening (Linux)

- systemd hardening flags (see unit file above).
- Run as non-root user.
- Follow CIS Linux Benchmarks (Ubuntu 22.04 / RHEL/Fedora equivalents):
  - restrict file permissions on env files (`chmod 600`)
  - audit access to secrets
  - enable automatic security updates where appropriate

---

## Performance Tuning

### Reduce webhook latency (p95)

Goal: respond to Twilio webhooks in < 200ms p95.

Actions:

- Do not call external services synchronously in webhook handler.
- Enqueue work (SQS/Kafka/Redis) and return 204/200 immediately.
- Pre-parse and validate quickly; avoid heavy logging.

Expected impact:

- Before: webhook handler does DB + ticket creation → 1–3s p95, retries increase load.
- After: enqueue only → <100–200ms p95, fewer retries, lower Twilio webhook backlog.

### Throughput scaling for outbound sends

- Use worker pool with concurrency control.
- Implement token bucket rate limiting per Messaging Service / sender type.
- Prefer Messaging Service with appropriate sender (short code/toll-free) for higher throughput.

Expected impact:

- Prevents 20429 spikes and reduces carrier filtering due to bursty patterns.

### Cost optimization

- Use Messaging Service geo-matching to reduce cross-region costs where applicable.
- Avoid MMS when SMS + link suffices.
- Use `maxPrice` carefully; too low increases failures.

### Encoding and segmentation

- GSM-7 vs UCS-2 affects segment count and cost.
- If you send non-GSM characters (e.g., emoji, some accented chars), messages may switch to UCS-2 and segment at 70 chars.

Mitigation:

- Normalize content where acceptable.
- Keep messages short; move details to links.

---

## Advanced Topics

### Idempotency across retries and deploys

Twilio REST `messages.create` is not idempotent by default. If your worker retries after a timeout, you may double-send.

Mitigations:

- Use an application-level idempotency key stored in DB.
- On timeout, query by your own correlation ID (store in `statusCallback` query string or in `body` is not safe). Better:
  - store job ID → message SID mapping once created
  - if create call times out, attempt to detect if message was created by checking Twilio logs is unreliable; prefer conservative “may have sent” handling and alert.

### Handling duplicate status callbacks

Twilio may send multiple callbacks for the same status or out of order.

- Store transitions with monotonic state machine:
  - `queued` < `sending` < `sent` < `delivered`
  - terminal failures: `undelivered`/`failed`
- If you receive `delivered` after `undelivered`, keep both but treat delivered as final if timestamp is later (rare but possible due to carrier reporting quirks).

### Multi-tenant systems

If you operate multiple Twilio subaccounts:

- Store per-tenant Account SID/Auth Token (or use API Keys).
- Validate webhooks per tenant:
  - signature validation uses the tenant’s auth token
  - route by `To` number or by dedicated webhook URL per tenant

### Media URL security for MMS

- Twilio fetches media from your URL; it must be reachable.
- If using signed URLs:
  - TTL must exceed Twilio fetch window (minutes to tens of minutes; be conservative).
- Do not require cookies.
- If you require auth headers, Twilio cannot provide them; use pre-signed URLs.

### Compliance gotchas

- Do not send marketing content from unregistered A2P campaigns.
- Maintain HELP/STOP responses and honor opt-out across channels if your policy requires it.
- Keep audit logs for consent (timestamp, source, IP/user agent if applicable).

---

## Usage Examples

### 1) Production outbound SMS with Messaging Service + status tracking (Node)

Files:

- `/srv/messaging-api/src/send.js`

```javascript
import "dotenv/config";
import twilio from "twilio";

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export async function sendDeployNotification({ to, buildId }) {
  const msg = await client.messages.create({
    messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID,
    to,
    body: `Build ${buildId} deployed to prod. Reply HELP for support, STOP to opt out.`,
    statusCallback: process.env.TWILIO_STATUS_CALLBACK_URL,
    provideFeedback: true,
  });

  return { sid: msg.sid, status: msg.status };
}
```

Run:

```bash
node -e 'import("./src/send.js").then(m=>m.sendDeployNotification({to:"+14155550123",buildId:"742"}).then(console.log))'
```

### 2) Inbound SMS → create ticket → reply with TwiML (FastAPI)

- `/srv/messaging-api/app.py`

```python
from fastapi import FastAPI, Request, Response
from twilio.request_validator import RequestValidator
from twilio.twiml.messaging_response import MessagingResponse
import os

app = FastAPI()
validator = RequestValidator(os.environ["TWILIO_AUTH_TOKEN"])

def create_ticket(from_number: str, body: str) -> str:
    # Replace with real integration
    return "INC-2048"

@app.post("/twilio/inbound")
async def inbound(request: Request):
    form = await request.form()
    signature = request.headers.get("X-Twilio-Signature", "")
    url = os.environ["TWILIO_INBOUND_WEBHOOK_PUBLIC_URL"]

    if not validator.validate(url, dict(form), signature):
        return Response("Invalid signature", status_code=403)

    from_number = form.get("From") or ""
    body = (form.get("Body") or "").strip()

    ticket = create_ticket(from_number, body)

    resp = MessagingResponse()
    resp.message(f"Created {ticket}. Reply HELP for options. Reply STOP to opt out.")
    return Response(str(resp), media_type="text/xml")
```

Run:

```bash
python3.11 -m venv .venv && source .venv/bin/activate
pip install fastapi==0.109.2 uvicorn==0.27.1 twilio==9.4.1 python-multipart==0.0.9
uvicorn app:app --host 0.0.0.0 --port 3000
```

### 3) Status callback → metrics + fallback enqueue (Express)

- `/srv/messaging-api/src/status.js`

```javascript
import express from "express";
import twilio from "twilio";

const app = express();
app.use(express.urlencoded({ extended: false, limit: "64kb" }));

app.post("/twilio/status", async (req, res) => {
  const signature = req.header("X-Twilio-Signature") || "";
  const url = process.env.TWILIO_STATUS_CALLBACK_PUBLIC_URL;

  const ok = twilio.validateRequest(process.env.TWILIO_AUTH_TOKEN, signature, url, req.body);
  if (!ok) return res.status(403).send("Invalid signature");

  const { MessageSid, MessageStatus, ErrorCode, To } = req.body;

  // Example: emit metric
  console.log("twilio_status", { MessageSid, MessageStatus, ErrorCode });

  if (MessageStatus === "failed" || MessageStatus === "undelivered") {
    // enqueue fallback (pseudo)
    console.log("enqueue_fallback", { to: To, messageSid: MessageSid, reason: ErrorCode });
  }

  res.status(204).send();
});

app.listen(3000);
```

### 4) MMS with signed URL (S3 presigned) + fallback to SMS link

Pseudo-flow:

- Generate presigned URL valid for 2 hours.
- Send MMS with media URL.
- If status callback returns `21614` or `undelivered`, send SMS with link.

Python snippet:

```python
msg = client.messages.create(
    messaging_service_sid=os.environ["TWILIO_MESSAGING_SERVICE_SID"],
    to="+14155550123",
    body="Incident screenshot attached.",
    media_url=[presigned_url],  # TTL >= 2h
    status_callback="https://api.example.com/twilio/status",
)
```

Fallback SMS body:

`MMS failed on your carrier. View: https://app.example.com/incidents/INC-2048`

### 5) Opt-out aware bulk send with concurrency + suppression

- Load recipients.
- Filter out opted-out in DB.
- Send with concurrency 20.
- On 21610, mark opted-out.

Node (sketch):

```javascript
import pLimit from "p-limit";
import twilio from "twilio";

const limit = pLimit(20);
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

async function sendOne(to) {
  try {
    return await client.messages.create({
      messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID,
      to,
      body: "Maintenance tonight 01:00-02:00 UTC. Reply STOP to opt out.",
      statusCallback: process.env.TWILIO_STATUS_CALLBACK_URL,
    });
  } catch (e) {
    const code = e?.code;
    if (code === 21610) {
      // mark opted out
      return null;
    }
    throw e;
  }
}

await Promise.all(recipients.map((to) => limit(() => sendOne(to))));
```

Install:

```bash
npm install p-limit@5.0.0 twilio@4.23.0
```

---

## Quick Reference

| Task | Command / API | Key flags / fields |
|---|---|---|
| Send SMS (CLI) | `twilio api:core:messages:create` | `--to`, `--from` or `--messaging-service-sid`, `--body`, `--status-callback`, `--provide-feedback`, `--max-price` |
| Send MMS (CLI) | `twilio api:core:messages:create` | `--media-url` (repeatable), `--body` |
| Fetch message | `twilio api:core:messages:fetch --sid SM...` | `--sid` |
| List messages | `twilio api:core:messages:list` | `--to`, `--from`, `--limit` |
| Create Messaging Service | `twilio api:messaging:v1:services:create` | `--friendly-name`, `--status-callback` |
| Update service webhooks | `twilio api:messaging:v1:services:update` | `--inbound-request-url`, `--inbound-method`, `--status-callback` |
| Attach number to service | `twilio api:messaging:v1:services:phone-numbers:create` | `--service-sid`, `--phone-number-sid` |
| Inbound webhook | HTTP POST `/twilio/inbound` | Validate `X-Twilio-Signature`, parse form fields |
| Status callback | HTTP POST `/twilio/status` | `MessageSid`, `MessageStatus`, `ErrorCode` |

---

## Graph Relationships

### DEPENDS_ON

- `twilio` SDK (Node 4.23.0 / Python 9.4.1)
- Public HTTPS ingress (NGINX/ALB/API Gateway)
- Persistent store for idempotency and message state (Postgres/DynamoDB)
- Queue for async processing (SQS/Kafka/Redis Streams) recommended

### COMPOSES

- `twilio-voice` (IVR can trigger SMS follow-ups; missed-call → SMS)
- `twilio-verify` (OTP via SMS; share webhook infra and signature validation patterns)
- `sendgrid-email` (fallback channel on undelivered; unified notification service)
- `observability` (metrics/logging/tracing for webhook latency and delivery rates)

### SIMILAR_TO

- `aws-sns-sms` (SMS sending + delivery receipts, different semantics)
- `messagebird-sms` / `vonage-sms` (carrier routing + webhook patterns)
- `firebase-cloud-messaging` (delivery callbacks conceptually similar, different channel)
