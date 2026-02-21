---
name: twilio-verify
cluster: twilio
description: "Verify: 2FA SMS/voice/email, TOTP, phone verification, Verify Guard fraud prevention, SNA"
tags: ["2fa","otp","verify","twilio"]
dependencies: []
composes: []
similar_to: []
called_by: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "twilio verify 2fa otp totp phone verification fraud sna"
---

## twilio-verify

### Purpose
This skill enables integration with Twilio's Verify API for implementing 2FA via SMS, voice, email, TOTP (Time-Based One-Time Passwords), phone number verification, and fraud prevention using Verify Guard and SNA (Session and Number Authentication).

### When to Use
Use this skill for securing user logins with 2FA in web/mobile apps, verifying phone numbers during sign-up, implementing TOTP for apps like banking, or adding fraud detection with Verify Guard to block suspicious activities.

### Key Capabilities
- Send one-time passcodes (OTPs) via SMS, voice, or email using the Verify API endpoint `/v2/Services/{ServiceSid}/Verifications`.
- Verify user-submitted codes with `/v2/Services/{ServiceSid}/VerificationChecks`, supporting TOTP via the `factor_type` parameter.
- Enable phone verification by checking carrier details and ownership.
- Integrate Verify Guard for fraud prevention by enabling it in service settings and using SNA endpoints like `/v2/Fraud/Guard`.
- Handle multiple channels in a single service, e.g., fallback from SMS to voice.

### Usage Patterns
Always authenticate requests with `$TWILIO_ACCOUNT_SID` and `$TWILIO_AUTH_TOKEN` environment variables. Start by creating a Verify Service via the Twilio Console or API, then use patterns like:  
1. Send verification: POST to a verification endpoint with the recipient's phone/email.  
2. Check code: POST to the check endpoint with the user's input.  
3. For TOTP: Generate and verify factors using the service's secret key.  
4. Fraud checks: Include SNA in verification requests to flag anomalies.

### Common Commands/API
Use Twilio's REST API (base URL: https://verify.twilio.com/v2). Set auth via env vars: `export TWILIO_ACCOUNT_SID=your_sid` and `export TWILIO_AUTH_TOKEN=your_token`.

- Create a Verify Service: POST /v2/Services with JSON body `{"FriendlyName": "MyService"}`.
- Send SMS verification: POST /v2/Services/{ServiceSid}/Verifications with params `To=+1234567890&Channel=sms`.
  Code snippet:
  ```python
  import os; import requests
  response = requests.post('https://verify.twilio.com/v2/Services/YOUR_SERVICE_SID/Verifications', 
                           auth=(os.environ['TWILIO_ACCOUNT_SID'], os.environ['TWILIO_AUTH_TOKEN']), 
                           data={'To': '+1234567890', 'Channel': 'sms'})
  ```
- Verify a code: POST /v2/Services/{ServiceSid}/VerificationChecks with params `To=+1234567890&Code=123456`.
  Code snippet:
  ```python
  response = requests.post('https://verify.twilio.com/v2/Services/YOUR_SERVICE_SID/VerificationChecks', 
                           auth=(os.environ['TWILIO_ACCOUNT_SID'], os.environ['TWILIO_AUTH_TOKEN']), 
                           data={'To': '+1234567890', 'Code': '123456'})
  ```
- TOTP setup: Use the Twilio helper library to create a factor: POST /v2/Services/{ServiceSid}/Entities/{Identity}/Factors with `friendly_name` and `factor_type=totp`.
  Code snippet:
  ```python
  from twilio.rest import Client; client = Client(os.environ['TWILIO_ACCOUNT_SID'], os.environ['TWILIO_AUTH_TOKEN'])
  factor = client.verify.v2.services('YOUR_SERVICE_SID').entities('user_identity').factors.create(factor_type='totp')
  ```
- Fraud check: Include `X-Twilio-Signature` in requests and enable Verify Guard via service config.

### Integration Notes
Install the Twilio Python library: `pip install twilio`. Initialize the client in your code using env vars for auth. Configure a Verify Service in the Twilio Console with settings like friendly name and fraud options. For multi-channel support, specify `Channel` in requests (e.g., 'sms' or 'call'). Use JSON config for services, e.g., `{"friendly_name": "AppVerify", "fraud": {"guard_enabled": true}}`. In apps, handle webhooks for verification status by setting a callback URL in the service.

### Error Handling
Check HTTP response codes: 401 for auth failures (invalid `$TWILIO_ACCOUNT_SID` or `$TWILIO_AUTH_TOKEN`), 400 for bad requests (e.g., invalid phone format), or 429 for rate limits. Parse error details from the response JSON, e.g., `response.json()['code']`. Handle specifically:  
- For invalid codes: Catch 60200 (invalid verification) and prompt user retry.  
- For network issues: Use retries with exponential backoff.  
Code snippet:
```python
try:
    response = requests.post(...)  # As above
    if response.status_code != 201:
        raise ValueError(response.json()['message'])
except Exception as e:
    print(f"Error handling: {e} - Retry or log for debugging")
```
Always log errors with context, like the request payload, for debugging.

### Concrete Usage Examples
Example 1: 2FA for user login in a web app.  
- On login attempt, send SMS verification: Use the send verification command with the user's phone.  
- Prompt for OTP, then verify: POST to /VerificationChecks with the code. If successful (status 201), grant access; otherwise, return an error.  
Full flow: Import client, send verification, check code as in Common Commands/API snippets.

Example 2: Phone verification during sign-up.  
- User submits phone number; create/send verification via POST /Verifications with Channel=sms.  
- After user enters code, verify with POST /VerificationChecks. If verified, proceed to account creation; if not, block and log for fraud.  
Integrate with app logic: Use the TOTP snippet for additional factors if needed.

### Graph Relationships
- Related to: twilio-messaging (for SMS channel integration)
- Related to: twilio-voice (for voice verification channels)
- Part of cluster: twilio
- Connected via tags: 2fa, otp, verify (e.g., links to general authentication skills)
