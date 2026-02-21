---
name: iot-security
cluster: iot
description: "Secure IoT devices: firmware hardening, encrypted transport, strong auth, safe OTA updates"
tags: ["iot"]
dependencies: []
composes: []
similar_to: []
called_by: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "iot-security iot"
---

# iot-security

## Purpose
This skill secures IoT devices by implementing firmware hardening, encrypted data transport, strong authentication mechanisms, and safe over-the-air (OTA) updates to prevent vulnerabilities and unauthorized access.

## When to Use
Use this skill when deploying or managing IoT devices that handle sensitive data, such as smart home systems, industrial sensors, or connected vehicles. Apply it during device provisioning, network setup, or when updating firmware to mitigate risks like man-in-the-middle attacks or firmware tampering.

## Key Capabilities
- Firmware hardening: Applies security patches and obfuscates code using tools like OpenSSL; e.g., enforces code signing with SHA-256 hashes.
- Encrypted transport: Implements TLS 1.3 for data in transit; supports AES-256 encryption with perfect forward secrecy.
- Strong authentication: Enforces multi-factor auth (MFA) via JWT tokens; requires API keys stored in env vars like `$IOT_API_KEY`.
- Safe OTA updates: Verifies update integrity with digital signatures and performs rollback on failure; uses delta updates to minimize bandwidth.

## Usage Patterns
To secure an IoT device, first authenticate using an API key, then apply hardening to firmware, enable encrypted channels, and schedule OTA updates. Pattern: Initialize with auth, configure security settings via CLI or API, test in a sandbox, and monitor for anomalies. For example, chain commands: authenticate, harden, encrypt, then update.

## Common Commands/API
Use the OpenClaw CLI for quick tasks or REST APIs for programmatic access. All commands require `$IOT_API_KEY` for authentication.

- CLI for firmware hardening:  
  `iot-secure harden --firmware /path/to/firmware.bin --key $IOT_API_KEY --sign-algo SHA-256`  
  This command signs and hardens the firmware; output includes a verification hash.

- API for encrypted transport:  
  Endpoint: POST /api/iot/encrypt-transport  
  Body: `{"deviceId": "device123", "protocol": "TLS1.3", "key": "$IOT_API_KEY"}`  
  Response: JSON with encryption status; handle with:  
  ```python
  import requests
  response = requests.post('https://api.openclaw.io/api/iot/encrypt-transport', json={"deviceId": "device123", "key": os.environ['IOT_API_KEY']})
  print(response.json()['status'])
  ```

- CLI for strong authentication:  
  `iot-secure auth setup --device-id device123 --mfa true --token $IOT_API_KEY`  
  Generates a JWT token for device access.

- API for safe OTA updates:  
  Endpoint: PUT /api/iot/ota-update  
  Body: `{"firmwareUrl": "https://updates.example.com/firmware.bin", "signature": "hex-signature", "key": "$IOT_API_KEY"}`  
  Code snippet:  
  ```javascript
  const fetch = require('node-fetch');
  fetch('https://api.openclaw.io/api/iot/ota-update', {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${process.env.IOT_API_KEY}` },
    body: JSON.stringify({firmwareUrl: 'https://updates.example.com/firmware.bin'})
  }).then(res => res.json());
  ```

Config formats: Use JSON for configurations, e.g.,  
```json
{
  "deviceId": "device123",
  "encryption": {"algo": "AES-256", "keySource": "env:IOT_API_KEY"},
  "auth": {"mfaEnabled": true}
}
```

## Integration Notes
Integrate this skill with other IoT tools by exporting configs as JSON files. For AWS IoT or Azure, map `$IOT_API_KEY` to their respective secrets managers. Use webhooks for real-time updates; e.g., POST to /api/iot/webhook with body containing event data. Ensure compatibility by checking TLS versions; add dependency: install via `pip install openclaw-iot` and import as `from openclaw_iot import SecureIoT`. Test integrations in a Docker container with environment variables set, e.g., `docker run -e IOT_API_KEY=yourkey image:tag`.

## Error Handling
Handle errors by checking HTTP status codes or CLI exit codes. For API calls, if status >= 400, parse the JSON error response (e.g., {"error": "Invalid key"}). Use try-except in code:  
```python
try:
    response = requests.post(url, headers={'Authorization': f'Bearer {os.environ.get("IOT_API_KEY")}'}))
    response.raise_for_status()
except requests.exceptions.HTTPError as err:
    print(f"Error: {err.response.json()['message']}; Retry with valid key.")
```  
For CLI, capture output: `result = subprocess.run(['iot-secure', 'harden', '--firmware', 'file.bin'], capture_output=True); if result.returncode != 0: log(result.stderr)`. Common errors: invalid API key (401), firmware mismatch (400); retry with exponential backoff.

## Concrete Usage Examples
1. Hardening firmware for a smart lock:  
   First, set env var: `export IOT_API_KEY=your_api_key`  
   Run: `iot-secure harden --firmware /home/user/smartlock.bin --key $IOT_API_KEY`  
   Then, verify: `iot-secure verify --firmware /home/user/smartlock.bin --expected-hash abc123`  
   This ensures the firmware is secured before deployment.

2. Setting up encrypted transport for sensor data:  
   Authenticate: `iot-secure auth setup --device-id sensor456 --token $IOT_API_KEY`  
   Enable encryption via API:  
   ```curl
   curl -X POST https://api.openclaw.io/api/iot/encrypt-transport -H "Authorization: Bearer $IOT_API_KEY" -d '{"deviceId": "sensor456", "protocol": "TLS1.3"}'
   ```  
   Monitor: Use the response to confirm encryption is active, then stream data securely.

## Graph Relationships
- Related to: iot-cluster (parent cluster for IoT skills)
- Connected via: tags ["iot"] to other skills like iot-device-management
- Dependencies: requires authentication from auth-service skill
- Influences: iot-networking for secure transport implementations
