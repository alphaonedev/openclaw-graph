---
name: twilio-lookup
cluster: twilio
description: "Phone intelligence: number validation, carrier lookup, caller ID, line type mobile/landline/VoIP, CNAM"
tags: ["lookup","phone","validation","twilio"]
dependencies: []
composes: []
similar_to: []
called_by: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "twilio lookup phone number carrier validation line type cnam ported"
---

# twilio-lookup

## Purpose
This skill uses Twilio's Lookup API to perform phone number intelligence tasks, including validation, carrier lookup, caller ID (CNAM), and line type detection (mobile, landline, VoIP). It's designed for integrating phone verification into applications or workflows.

## When to Use
Use this skill when validating user-provided phone numbers in sign-ups, checking carrier info for messaging routing, determining line types for compliance (e.g., avoiding VoIP for SMS), or fetching CNAM for caller ID displays. Apply it in scenarios like user onboarding, fraud detection, or telecom analytics.

## Key Capabilities
- Validate phone numbers: Checks if a number is valid and properly formatted.
- Carrier lookup: Retrieves the carrier name and type (e.g., AT&T, Verizon).
- Line type detection: Identifies if the number is mobile, landline, or VoIP.
- Caller ID (CNAM): Fetches the Caller ID Name associated with the number.
- Ported number check: Determines if the number has been ported to another carrier.
- Additional data: Includes country code, national format, and potential add-ons like caller name.

## Usage Patterns
Always authenticate with Twilio credentials via environment variables. Use synchronous calls for real-time lookups in interactive apps. For high-volume scenarios, batch requests via API; limit to 1 request per second to avoid rate limits. Structure workflows to handle responses as JSON objects, parsing fields like "carrier" or "line_type". Test with sample numbers in non-production environments first.

## Common Commands/API
Authenticate using env vars: `$TWILIO_ACCOUNT_SID` and `$TWILIO_AUTH_TOKEN`. Use Twilio CLI or direct API calls.

- **CLI Command**: Fetch phone details with `twilio api:core:lookups:v1:phone-numbers:fetch --phone-number=+1234567890 --add-ons="caller_name"`. Add flags like `--add-ons` for CNAM.
  
- **API Endpoint**: Send a GET request to `https://lookups.twilio.com/v1/PhoneNumbers/+1234567890`. Include headers: `Authorization: Basic <base64-encoded SID:token>`. Query params: `?Type=carrier` for carrier info or `?AddOns=caller_name` for CNAM.

- **Code Snippet (Python)**:
  ```python
  from twilio.rest import Client
  client = Client(os.environ['TWILIO_ACCOUNT_SID'], os.environ['TWILIO_AUTH_TOKEN'])
  response = client.lookups.v1.phone_numbers('+1234567890').fetch(type=['carrier'])
  print(response.carrier['name'])
  ```

- **Code Snippet (Node.js)**:
  ```javascript
  const twilio = require('twilio');
  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  client.lookups.v1.phoneNumbers('+1234567890').fetch({type: ['line_type']})
    .then(data => console.log(data.nationalFormat));
  ```

Config formats: Store credentials in .env files as `TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxx` and `TWILIO_AUTH_TOKEN=your_auth_token`. Use JSON responses for parsing, e.g., `{ "country_code": "US", "carrier": { "name": "Verizon" } }`.

## Integration Notes
Set up Twilio account and obtain SID/token from the Twilio console. Integrate by importing Twilio libraries (e.g., via npm: `npm install twilio`). Handle rate limits (1 req/sec) by implementing delays or queues. For web apps, use this skill in backend services to avoid exposing keys; pass results via API responses. Combine with other Twilio skills (e.g., for SMS) by sharing the same auth env vars. Test integrations with Twilio's sandbox numbers like +15005550006.

## Error Handling
Check for HTTP status codes: 404 for invalid numbers, 401 for auth failures, 429 for rate limits. In code, wrap calls in try-except blocks; e.g., in Python:
```python
try:
    response = client.lookups.v1.phone_numbers('+1234567890').fetch()
except twilio.base.exceptions.TwilioException as e:
    if e.code == 20404:  # Invalid number
        print("Number not found")
    else:
        print(f"Error: {e}")
```
For CLI, parse output errors like "Error: Phone number is invalid". Retry transient errors (e.g., 5xx) with exponential backoff. Validate inputs (e.g., ensure E.164 format) before calls to reduce errors.

## Graph Relationships
- Related Cluster: twilio (e.g., links to other Twilio skills like twilio-sms for messaging integration).
- Related Tags: lookup (connects to general data retrieval skills), phone (ties to telephony tools), validation (links to data verification skills), twilio (groups all Twilio-based capabilities).
