---
name: network-forensics
cluster: blue-team
description: "Investigates network traffic patterns to identify and mitigate security threats."
tags: ["network","forensics","security"]
dependencies: []
composes: []
similar_to: []
called_by: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "network forensics security analysis traffic monitoring intrusion detection"
---

# network-forensics

## Purpose
This skill enables the AI to investigate network traffic patterns, identify anomalies, and mitigate threats by analyzing packet captures, logs, and real-time data. It focuses on detecting intrusions, malware communications, and unauthorized access.

## When to Use
Use this skill during security incidents, routine monitoring, or compliance audits. Apply it when network logs show unusual traffic spikes, unknown IP connections, or potential DDoS attacks. Ideal for blue-team operations in environments with high network activity, such as corporate networks or cloud infrastructures.

## Key Capabilities
- Parse PCAP files to extract metadata like source/destination IPs, ports, and protocols.
- Detect anomalies using rulesets, e.g., identifying SYN floods or unusual port scans.
- Generate reports in JSON or CSV format for threat intelligence.
- Integrate with tools like tcpdump for live capture or Zeek for advanced protocol analysis.
- Support real-time monitoring via API hooks to flag threats immediately.

## Usage Patterns
To use this skill, first authenticate with an API key via environment variable (e.g., `$NETWORK_FORENSICS_API_KEY`). Invoke it programmatically in Python scripts or via CLI for analysis tasks. For file-based analysis, provide a PCAP file; for live monitoring, specify a network interface. Always wrap calls in error-handling blocks to manage failures. Chain with other blue-team skills for automated workflows, like feeding results to an intrusion detection system.

## Common Commands/API
Use the following CLI commands or API endpoints for core operations:

- CLI: Analyze a PCAP file: `openclaw network-forensics analyze --file path/to/capture.pcap --output report.json`
- CLI: Monitor live traffic: `openclaw network-forensics monitor --interface eth0 --duration 300 --alert-level high`
- API Endpoint: POST to `/api/network/analyze` with JSON body: `{"file": "base64_encoded_pcap", "rules": ["syn_flood", "port_scan"]}`. Set header: `Authorization: Bearer $NETWORK_FORENSICS_API_KEY`
- API Endpoint: GET from `/api/network/status` to check ongoing sessions: Response includes active alerts in JSON format.
- Code Snippet (Python): 
  ```python
  import requests
  api_key = os.environ.get('NETWORK_FORENSICS_API_KEY')
  response = requests.post('https://api.openclaw.com/api/network/analyze', headers={'Authorization': f'Bearer {api_key}'}, json={'file': 'capture.pcap'})
  print(response.json()['threats'])
  ```
- Config Format: Use YAML for rulesets, e.g.:
  ```
  rules:
    - name: syn_flood
      threshold: 1000 packets/sec
    - name: port_scan
      ports: [80, 443, 22]
  ```

## Integration Notes
Integrate this skill with other tools by exporting results to SIEM systems like Splunk or ELK Stack. For authentication, always use `$NETWORK_FORENSICS_API_KEY` in environment variables. In code, handle dependencies like installing `scapy` for PCAP processing: `pip install scapy`. To combine with other OpenClaw skills, use the SDK: e.g., call `network-forensics` output as input to `intrusion-detection`. Ensure network interfaces are configured for capture, e.g., via `sudo setcap cap_net_raw+ep /path/to/openclaw binary`. Test integrations in a sandbox environment to avoid production disruptions.

## Error Handling
Always check for common errors like invalid PCAP files, network timeouts, or authentication failures. In CLI, errors return exit codes (e.g., 1 for file not found). In API calls, parse HTTP status codes: 401 for unauthorized (check `$NETWORK_FORENSICS_API_KEY`), 400 for bad requests. Use try-except in code snippets:
```python
try:
    response = requests.post('https://api.openclaw.com/api/network/analyze', ...)
    response.raise_for_status()
except requests.exceptions.HTTPError as err:
    print(f"Error: {err} - Verify API key and input format")
except Exception as e:
    print(f"Unexpected error: {e} - Retry with debug flag")
```
Log errors with timestamps and retry transient issues up to 3 times. For CLI, add `--debug` flag to output detailed traces.

## Concrete Usage Examples
1. **Analyze a captured PCAP file for threats**: Suppose you have a file `suspicious.pcap` from a potential breach. Run: `openclaw network-forensics analyze --file suspicious.pcap --rules syn_flood`. This outputs a JSON report with detected threats. In code: Use the API to process it and alert if threats > 5, then integrate with email notification.
   
2. **Monitor live traffic for intrusions**: On a server with interface `eth0`, execute: `openclaw network-forensics monitor --interface eth0 --duration 600 --alert-level medium`. This captures packets for 10 minutes and flags anomalies like port scans. Script it in a loop for continuous monitoring, e.g., in a cron job, and pipe results to a database for long-term analysis.

## Graph Relationships
- Related to: "intrusion-detection" (shares threat detection logic)
- Depends on: "log-analysis" (for correlating network logs)
- Complements: "endpoint-security" (for holistic blue-team defense)
- Clusters with: "blue-team" skills like "vulnerability-scanning"
