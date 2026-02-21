---
name: ai-gateway
cluster: aimlops
description: "Manages AI gateway for routing, securing, and monitoring AI service requests in ML operations."
tags: ["ai","gateway","mlops"]
dependencies: []
composes: []
similar_to: []
called_by: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "ai gateway mlops routing api security"
---

# ai-gateway

## Purpose
This skill manages an AI gateway for routing, securing, and monitoring AI service requests in ML operations, ensuring efficient traffic handling, API security, and performance tracking within the aimlops cluster.

## When to Use
Use this skill when building ML pipelines that require centralized routing of AI requests, such as in production environments with multiple AI models, to enforce security policies, monitor traffic, or scale API endpoints. Apply it in scenarios involving microservices for AI inference or when integrating with tools like Kubernetes for aimlops workflows.

## Key Capabilities
- **Routing**: Dynamically route requests to AI services based on rules, using path-based or header-based matching.
- **Security**: Enforce authentication, rate limiting, and encryption via JWT or API keys.
- **Monitoring**: Track metrics like request latency and error rates through integrated logging and Prometheus exporters.
- **Configuration**: Support YAML-based configs for defining routes, e.g., specifying source and destination endpoints.
- **Scalability**: Handle load balancing across multiple AI backends with automatic failover.

## Usage Patterns
To use this skill, first set up the AI gateway via CLI or API, then define routes and security rules. Always authenticate requests using the `$AI_GATEWAY_API_KEY` environment variable. For CLI usage, initialize with `ai-gateway-cli init --config path/to/config.yaml`, then apply changes with `ai-gateway-cli apply`. In code, import the SDK and call methods like `createRoute()` for programmatic setup. Monitor usage by querying metrics endpoints periodically.

## Common Commands/API
- **CLI Commands**:
  - Initialize gateway: `ai-gateway-cli init --cluster aimlops --key $AI_GATEWAY_API_KEY`
  - Add a route: `ai-gateway-cli add-route --path /predict --target http://ai-service:8080 --method POST`
  - Secure an endpoint: `ai-gateway-cli secure --endpoint /predict --auth jwt --rate-limit 100/min`
  - View metrics: `ai-gateway-cli metrics --format json`

- **API Endpoints**:
  - Create route: POST /api/v1/routes with body `{ "path": "/predict", "target": "http://ai-service:8080", "method": "POST" }`
  - Update security: PUT /api/v1/security/{endpoint} with body `{ "authType": "jwt", "rateLimit": 100 }`
  - Get metrics: GET /api/v1/metrics?type=latency

- **Code Snippets**:
  ```python
  import requests
  headers = {'Authorization': f'Bearer {os.environ.get("AI_GATEWAY_API_KEY")}'}
  response = requests.post('http://gateway:8080/api/v1/routes', json={"path": "/predict", "target": "http://ai-service:8080"}, headers=headers)
  ```
  ```bash
  export AI_GATEWAY_API_KEY=your_api_key_here
  ai-gateway-cli add-route --path /chat --target http://llm-service:5000
  ```

- **Config Formats**:
  Use YAML for configurations, e.g.:
  ```
  routes:
    - path: /predict
      target: http://ai-service:8080
      methods: [POST]
  security:
    - endpoint: /predict
      auth: jwt
      rateLimit: 100
  ```

## Integration Notes
Integrate with aimlops by deploying the gateway as a sidecar or standalone service in your cluster. For Kubernetes, add annotations to pods, e.g., `kubectl annotate pod ai-pod aimlops/gateway=true`. Use the SDK to link with other AI tools: import and initialize with `AI_Gateway(api_key=os.environ['AI_GATEWAY_API_KEY']).connect(cluster='aimlops')`. Ensure compatibility by matching tags like "ai" and "mlops". For external services, set up webhooks by configuring the gateway's callback URL in your config, e.g., add `callback: http://external-service/webhook` in YAML.

## Error Handling
Handle errors by checking HTTP status codes from API responses; for example, 401 indicates authentication failure, so retry with `headers['Authorization'] = f'Bearer {new_key}'`. For CLI, parse output errors like "Error: Invalid route path" and correct inputs. Common issues include missing API keys—always verify `if not os.environ.get('AI_GATEWAY_API_KEY'): raise ValueError('API key required')`. Log errors using the gateway's built-in logger: enable with `ai-gateway-cli config --log-level debug`, then monitor for patterns like rate limit exceedances and implement retries with exponential backoff in code.

## Concrete Usage Examples
1. **Route AI Requests**: To route prediction requests to an ML model, first export your API key, then use the CLI: `export AI_GATEWAY_API_KEY=abc123; ai-gateway-cli add-route --path /ml-predict --target http://model-service:8000`. Verify with a curl request: `curl -H "Authorization: Bearer abc123" http://gateway:8080/ml-predict -d '{"input": "data"}'`.
   
2. **Secure and Monitor API**: Secure an endpoint and monitor traffic by running: `ai-gateway-cli secure --endpoint /chat --auth api-key --rate-limit 50/min`. Then, query metrics: `ai-gateway-cli metrics --endpoint /chat`. In code, handle it as: ```python
import requests; headers = {'Authorization': f'Bearer {os.environ["AI_GATEWAY_API_KEY"]}'}; requests.get('http://gateway:8080/api/v1/metrics', headers=headers)
   ```

## Graph Relationships
- Related to: aimlops (cluster), ai (tag), mlops (tag)
- Depends on: authentication services for security
- Used by: AI services for routing and monitoring
- Integrates with: Kubernetes for deployment, Prometheus for metrics collection
