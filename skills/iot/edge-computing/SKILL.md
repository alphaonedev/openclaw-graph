---
name: edge-computing
cluster: iot
description: "Process data at the network edge near IoT devices to minimize latency and bandwidth"
tags: ["iot","edge"]
dependencies: []
composes: []
similar_to: []
called_by: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "edge-computing iot"
---

## edge-computing

### Purpose
This skill enables processing data at the network edge near IoT devices, reducing latency and bandwidth usage by running computations closer to data sources. It integrates with IoT frameworks to handle real-time data streams efficiently.

### When to Use
Use this skill for applications requiring low-latency responses, such as real-time analytics on sensor data, autonomous vehicle edge processing, or smart city infrastructure monitoring. Apply it when data volume is high and transmitting to central servers is inefficient, like in remote industrial IoT setups or mobile edge networks. Avoid it for non-time-sensitive tasks or when centralized processing is sufficient due to simplicity.

### Key Capabilities
- Deploy edge functions via CLI or API to run on devices, e.g., process video streams from cameras without sending raw data to the cloud.
- Support for lightweight containers or virtual environments on edge devices, compatible with ARM or x86 architectures.
- Real-time data aggregation and filtering, using protocols like MQTT or CoAP for IoT communication.
- Scalable resource management, allowing dynamic allocation of CPU/GPU based on device capabilities.
- Monitoring and logging of edge processes, with metrics export to tools like Prometheus via HTTP endpoints.
- Security features including TLS encryption for data in transit and role-based access control for function deployment.
- Integration with IoT platforms like AWS IoT Core or Azure IoT Edge for seamless device management.
- Error-resilient designs, such as automatic retries for failed edge tasks with configurable backoff strategies.
- Customizable data pipelines, where you define processing steps in JSON config files, e.g., {"steps": [{"type": "filter", "condition": "value > 10"}]}.
- Support for offline operation, caching data locally on devices until connectivity is restored.

### Usage Patterns
To use this skill, first set up authentication via environment variables like `$EDGE_API_KEY`. Invoke edge processing by deploying functions to specific devices, then trigger them with IoT events. For example, in a Node.js app, import the OpenClaw SDK and call deployment methods. Always specify device IDs and function parameters for targeted execution. Handle asynchronous responses by polling status endpoints. Common patterns include event-driven triggers (e.g., via webhooks) or scheduled jobs. Test locally first using simulation modes before deploying to production devices.

### Common Commands/API
Use the OpenClaw CLI for edge operations, requiring `$EDGE_API_KEY` for authenticated requests. Example CLI command to deploy a function:
```
edge-compute deploy --function processSensorData.js --device-id dev123 --region us-west-2
```
To run a function manually:
```
edge-compute run --function-id func456 --input '{"data": [1,2,3]}' --env VAR=value
```
API endpoints include POST /api/edge/deploy for function deployment, with a JSON body like {"function": "code.js", "device": "dev123"}. For status checks, use GET /api/edge/status/{function-id}, returning JSON with fields like {"status": "running", "errors": []}. Configure functions via YAML files, e.g.:
```
function:
  name: sensorProcessor
  language: javascript
  resources:
    cpu: 0.5
```
Invoke via SDK in Python:
```
import openclaw
client = openclaw.EdgeClient(api_key=os.environ['EDGE_API_KEY'])
response = client.deploy_function(device='dev123', function_code='def process(data): return data * 2')
```
For querying metrics, use GET /api/edge/metrics, with query params like ?device=dev123.

### Integration Notes
Integrate this skill with IoT platforms by mapping device IDs and using webhooks for event triggers. For AWS IoT, set up rules to forward messages to OpenClaw endpoints, e.g., configure an AWS rule with target URL https://api.openclaw.com/edge/invoke. Use environment variables for keys, like `$AWS_IOT_ENDPOINT` alongside `$EDGE_API_KEY`. In code, handle SDK initialization with config objects, e.g., in Go:
```
cfg := openclaw.Config{APIKey: os.Getenv("EDGE_API_KEY"), Region: "us-west-2"}
client, err := openclaw.NewEdgeClient(cfg)
```
Ensure compatibility by matching protocol versions (e.g., MQTT 3.1.1) and handle data serialization (JSON or Protocol Buffers). For microservices, embed as a library and expose gRPC endpoints for inter-service communication.

### Error Handling
Always check for authentication errors first, using try-catch blocks around API calls, e.g., in JavaScript:
```
try {
  await client.deployFunction({device: 'dev123'});
} catch (error) {
  if (error.code === 'AUTH_FAILED') console.error('Invalid $EDGE_API_KEY');
}
```
Handle device-specific errors like timeouts or connectivity issues by implementing retries with exponential backoff, e.g., using a loop with increasing delays. Parse API responses for error codes (e.g., 404 for unknown devices) and log details. For CLI commands, use --verbose flag to capture output and diagnose issues. Configure global error handlers in your app to fallback to cloud processing if edge fails. Test with simulated errors, like forcing network failures, and use the /api/edge/logs endpoint to retrieve function logs.

### Graph Relationships
- Connected to cluster: iot
- Tagged with: iot, edge
- Related skills: Based on embedding hint, links to other iot-related skills like device-management or data-streaming
