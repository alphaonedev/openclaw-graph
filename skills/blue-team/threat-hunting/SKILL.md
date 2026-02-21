---
name: threat-hunting
cluster: blue-team
description: "Proactively detect and respond to advanced cyber threats using forensic tools and analytics in enterprise environments."
tags: ["threat-hunting","blue-team","cybersecurity"]
dependencies: []
composes: []
similar_to: []
called_by: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "threat hunting blue team cybersecurity detection forensics"
---

## threat-hunting

### Purpose
This skill enables proactive detection and response to advanced cyber threats in enterprise environments using forensic tools and analytics. It focuses on identifying anomalies, investigating incidents, and mitigating risks through data-driven methods.

### When to Use
Use this skill during active threat investigations, such as unusual network traffic, endpoint anomalies, or post-breach analysis. Apply it in blue-team operations like monitoring for indicators of compromise (IOCs), conducting regular hunts in large-scale networks, or integrating with SIEM systems for real-time alerts.

### Key Capabilities
- Analyze memory dumps with Volatility to detect malware processes.
- Parse network logs using Zeek for identifying suspicious connections.
- Query Elasticsearch for threat patterns via custom queries.
- Generate timelines from forensic artifacts using tools like Plaso.
- Automate threat correlation with Sigma rules for log analysis.

### Usage Patterns
Start by collecting data from endpoints or networks, then apply analytics to identify threats. For example, use a pipeline: ingest logs → run queries → correlate events → respond. Always scope hunts to specific IOCs or time windows. If integrating with automation, wrap commands in scripts that handle input validation and output parsing. For multi-step hunts, chain tools like Zeek for capture and Elasticsearch for indexing.

### Common Commands/API
Use these commands for threat hunting tasks. Set environment variables for authentication, e.g., export `$ELASTICSEARCH_API_KEY` for API access.

- **Volatility for memory forensics**:  
  `volatility -f memory.dump --profile=Win7SP1x64 pslist`  
  This lists processes; add `-o output.json` to save results.

- **Zeek for network analysis**:  
  `zeek -r capture.pcap policy/scripts`  
  Follow with `zeek-cut conn.log | grep "suspicious_ip"` to filter logs.

- **Elasticsearch API for log queries**:  
  Use endpoint: `POST https://es.example.com/_search` with body:  
  `{ "query": { "match": { "message": "malware" } } }`  
  Authenticate via header: `Authorization: Bearer $ELASTICSEARCH_API_KEY`.

- **Plaso for timeline generation**:  
  `log2timeline.py --storage-file timeline.plaso /path/to/logs`  
  Then query: `psort.py -w output.csv timeline.plaso`.

Config formats: Use JSON for Elasticsearch queries (e.g., above) or INI for Zeek policies (e.g., `[site] interface=eth0`).

### Integration Notes
Integrate this skill with other blue-team tools by piping outputs, e.g., Zeek logs to Elasticsearch via Logstash. For API integrations, use `$ELASTICSEARCH_API_KEY` in scripts:  
```bash
curl -H "Authorization: Bearer $ELASTICSEARCH_API_KEY" -X POST https://es.example.com/_ingest/pipeline
```  
Ensure tools share formats like JSON for data exchange. If using containers, mount volumes for forensic data access, e.g., Docker run with `-v /host/logs:/container/logs`. Test integrations in a sandbox to avoid disrupting production environments.

### Error Handling
Check for common errors like invalid profiles in Volatility (e.g., if `--profile` mismatches, output "Error: No suitable profile found"; retry with `volatility --info` to list options). For API calls, handle 4xx/5xx responses:  
```python
import requests; response = requests.post(url, headers={'Authorization': f'Bearer {os.environ.get("ELASTICSEARCH_API_KEY")}'}); if response.status_code != 200: raise ValueError(response.text)
```  
In scripts, use try-catch for file not found errors, e.g., in Zeek: check if pcap exists before processing. Log errors to a file with timestamps for auditing.

### Concrete Usage Examples
1. **Detect malware in a memory dump**:  
   First, export `$VOLATILITY_PATH=/path/to/volatility`. Run: `volatility -f suspect.dump --profile=Linuxx64x64 pslist | grep "suspicious_process"`. If matches found, alert via script: `echo "Threat detected" >> alert.log`.

2. **Hunt for network anomalies**:  
   Capture traffic with Zeek: `zeek -i eth0 -C`. Then query: `zeek-cut conn.log | awk '$3 == "192.168.1.100" {print}'`. Integrate with Elasticsearch: `curl -H "Authorization: Bearer $ELASTICSEARCH_API_KEY" -d '{"query":{"match":{"source_ip":"192.168.1.100"}}}' https://es.example.com/_search`.

### Graph Relationships
- Related to: blue-team (cluster), as it shares tools for defensive operations.
- Connected via tags: threat-hunting (direct match), cybersecurity (overlaps with detection skills), blue-team (cluster linkage).
- Links to: Other blue-team skills like "incident-response" for follow-up actions, and "forensics-analysis" for deeper data examination.
