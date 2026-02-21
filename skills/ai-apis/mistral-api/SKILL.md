---
name: mistral-api
cluster: ai-apis
description: "Mistral AI API for models like large/medium/small, with function calling and code generation."
tags: ["ai-apis","api"]
dependencies: []
composes: []
similar_to: []
called_by: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "keywords"
---

# mistral-api

## Purpose
This skill enables interaction with the Mistral AI API, providing access to models like Mistral Large, Medium, and Small for tasks such as text generation, function calling, and code creation. It's designed for developers needing advanced AI capabilities via a RESTful API.

## When to Use
- When you need high-performance AI models for natural language processing, such as generating code or responding to queries.
- For applications requiring function calling, like integrating AI with external tools or APIs.
- In scenarios where OpenAI alternatives are restricted, but similar capabilities are needed.
- When building chatbots, code assistants, or data analysis tools that leverage Mistral's efficient models.

## Key Capabilities
- Access Mistral models (e.g., mistral-large, mistral-medium, mistral-small) via API endpoints for text completion and chat.
- Support for function calling, allowing the AI to invoke tools based on user input.
- Code generation features, optimized for programming tasks like writing functions or debugging.
- Streaming responses for real-time applications, reducing latency in interactive sessions.
- Rate limiting and usage tracking through API headers.

## Usage Patterns
To use this skill, set up authentication with your Mistral API key via environment variable (e.g., `export MISTRAL_API_KEY=your_key`). Then, make HTTP requests to the base endpoint `https://api.mistral.ai/v1`. Always specify the model in requests for targeted performance. For function calling, include a "tools" array in the payload. Integrate via HTTP clients like `requests` in Python or `fetch` in JavaScript. Handle responses asynchronously to manage streaming data.

## Common Commands/API
- **Endpoint for Chat Completions**: POST `https://api.mistral.ai/v1/chat/completions`
  - Required headers: `Authorization: Bearer $MISTRAL_API_KEY`, `Content-Type: application/json`
  - Payload example: `{"model": "mistral-large", "messages": [{"role": "user", "content": "Hello"}], "tools": [{"type": "function", "function": {"name": "get_weather"}}]}`
  - CLI command via curl: `curl -X POST -H "Authorization: Bearer $MISTRAL_API_KEY" -H "Content-Type: application/json" -d '{"model":"mistral-medium","messages":[{"role":"user","content":"Write a Python function"}]}' https://api.mistral.ai/v1/chat/completions`
- **Endpoint for Embeddings**: POST `https://api.mistral.ai/v1/embeddings`
  - Flags: Include `input` as an array of strings; specify `model` like "mistral-small".
  - Example: Payload `{"input": ["Hello world"], "model": "mistral-small"}`
- **Config Format**: Use JSON for all requests; store API key in `.env` files as `MISTRAL_API_KEY=sk-mistral-...`.
- **Common Flags**: Add `stream: true` in payload for streaming; use `max_tokens: 512` to limit response length.

## Integration Notes
- Set the API key as an environment variable: `export MISTRAL_API_KEY=your_api_key` before running scripts.
- In code, import libraries like `requests` in Python: `import os; api_key = os.environ.get('MISTRAL_API_KEY')`.
- For function calling, define tools in your application and reference them in API payloads, e.g., ensure your backend handles calls to external APIs.
- Rate limits: Mistral enforces per-minute limits; monitor via response headers and implement retry logic with exponential backoff.
- Testing: Use Postman or similar tools to test endpoints; ensure HTTPS is used for all requests.

## Error Handling
- Common errors: 401 Unauthorized (fix by verifying $MISTRAL_API_KEY); 429 Too Many Requests (add retry with delay, e.g., wait 5-10 seconds).
- Handle API errors in code: Check response status codes, e.g., in Python: `if response.status_code == 429: time.sleep(10); retry_request()`.
- For invalid payloads: Validate JSON before sending; catch JSON decode errors on response.
- Specific: If model not found, ensure model string matches available options (e.g., "mistral-large"); log errors with details like error message and HTTP code.

## Concrete Usage Examples
### Example 1: Generate Code Snippet
To generate a simple Python function using Mistral API:
1. Set environment: `export MISTRAL_API_KEY=your_key`
2. Run curl command: `curl -X POST -H "Authorization: Bearer $MISTRAL_API_KEY" -H "Content-Type: application/json" -d '{"model": "mistral-medium", "messages": [{"role": "user", "content": "Write a function to add two numbers in Python"}]}' https://api.mistral.ai/v1/chat/completions`
3. Expected output: A JSON response with the generated code, e.g., `{"choices": [{"message": {"content": "def add(a, b): return a + b"}}]}`

### Example 2: Perform Function Calling
To use function calling for weather data:
1. Prepare payload with tools: Include `{"tools": [{"type": "function", "function": {"name": "get_weather", "parameters": {"location": "string"}}}]`
2. Send request: In code, use Python: `response = requests.post('https://api.mistral.ai/v1/chat/completions', headers={'Authorization': f'Bearer {os.environ["MISTRAL_API_KEY"]}'}, json={'model': 'mistral-large', 'messages': [{'role': 'user', 'content': 'Get weather for New York'}], 'tools': [...]})`
3. Handle response: Parse the response to execute the function call, e.g., if AI responds with a tool call, invoke your local `get_weather` function.

## Graph Relationships
- Related to: ai-apis cluster (e.g., connected to openai-api for similar AI capabilities)
- Depends on: authentication services (e.g., key management systems)
- Integrates with: function-calling tools (e.g., linked to external APIs like weather services)
