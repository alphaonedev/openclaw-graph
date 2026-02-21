---
name: chaos-engineering
cluster: devops-sre
description: "Introduces controlled failures to test and enhance system resilience in distributed environments."
tags: ["chaos-engineering","resilience","fault-injection"]
dependencies: []
composes: []
similar_to: []
called_by: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "chaos engineering fault injection resilience testing distributed systems"
---

# chaos-engineering

## Purpose
This skill enables OpenClaw to simulate failures in distributed systems, such as network partitions or pod kills, to identify weaknesses and improve resilience. It uses tools like Chaos Toolkit or similar integrations to inject faults programmatically.

## When to Use
Use this skill during system testing phases, before production releases, or in response to outages to validate resilience. Apply it in microservices architectures, cloud environments (e.g., Kubernetes), or when dealing with high-availability setups to ensure systems handle failures gracefully.

## Key Capabilities
- Inject faults like CPU stress, network latency, or pod evictions via CLI or API.
- Generate reports on system behavior post-failure, including metrics like recovery time.
- Support for custom experiments defined in YAML configs, e.g., specifying targets and durations.
- Integration with monitoring tools to correlate faults with real-time metrics.
- Automated rollback of experiments to restore original state.

## Usage Patterns
To run a chaos experiment, first define a configuration file, then execute via CLI. For API usage, authenticate and send requests to trigger events. Always run in a staging environment first. Pattern: Prepare config → Inject fault → Monitor effects → Analyze results. For repeated tests, use loops in scripts to vary parameters like duration or intensity.

## Common Commands/API
Use the OpenClaw CLI for chaos operations, requiring `$CHAOS_API_KEY` for authentication. Example CLI command:
```
ocla chaos inject --type network-latency --duration 30s --target pod=myapp-123 --key $CHAOS_API_KEY
```
API endpoint: POST to `/api/v1/chaos/experiments` with JSON body:
```
{ "experiment": "network-partition", "targets": ["service:db"], "duration": 60 }
```
Config format (YAML snippet):
```
apiVersion: chaos.openclaw/v1
kind: Experiment
spec:
  type: cpu-stress
  percentage: 80
```
To stop an experiment: `ocla chaos stop --id exp-456 --key $CHAOS_API_KEY`.

## Integration Notes
Integrate with Kubernetes by setting up a Chaos Engine operator; add annotations to deployments for auto-discovery. For monitoring, link with Prometheus via webhooks: e.g., export metrics to `/metrics` endpoint. Use environment variables for secrets, like `export CHAOS_API_KEY=your-key`. In code, import as a module: 
```
import openclaw.chaos as oc
oc.inject_fault(type='pod-kill', target='app-pod')
```
Ensure compatibility with CI/CD tools by wrapping commands in scripts, e.g., in Jenkins: `sh 'ocla chaos inject ...'`.

## Error Handling
Check for errors like invalid targets or authentication failures; use try-catch in scripts. Example snippet:
```
try:
  ocla chaos inject --type pod-kill --target invalid-pod --key $CHAOS_API_KEY
except subprocess.CalledProcessError as e:
  print(f"Error: {e} - Check pod existence and API key")
```
Common issues: Rate limits (wait and retry), permission denials (verify RBAC), or experiment timeouts (set via `--timeout 120s`). Log all outputs and use `--dry-run` flag to preview actions without executing.

## Concrete Usage Examples
1. **Test Kubernetes pod resilience**: To simulate a pod failure in a staging cluster, run: `ocla chaos inject --type pod-kill --target deployment/myapp --duration 10s --key $CHAOS_API_KEY`. Then, verify recovery by checking pod status with `kubectl get pods` and analyze logs for downtime.
2. **Inject network latency for API testing**: For a microservice, create a config file and execute: `ocla chaos run --config path/to/experiment.yaml --key $CHAOS_API_KEY`. The YAML might look like: `spec: type: network-latency delay: 500ms`. Monitor with integrated tools to measure response times before and after.

## Graph Relationships
- Related to: devops-sre (cluster), monitoring (for fault analysis), deployment (for targeting systems), fault-injection (tag overlap).
- Connected via: resilience (tag), distributed-systems (embedding hint), enabling workflows with chaos-engineering and testing skills.
