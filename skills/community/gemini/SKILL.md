---
name: gemini
cluster: community
description: "Google Gemini API: multimodal, long context (1M tokens), function calling, grounding, code execution"
tags: ["gemini","google","ai","multimodal"]
dependencies: []
composes: []
similar_to: []
called_by: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "google gemini api multimodal long context function calling"
---

## gemini

### Purpose
This skill interfaces with the Google Gemini API to enable advanced AI interactions, focusing on multimodal inputs, extended context handling, and integrated features like function calling and code execution. Use it to extend OpenClaw's capabilities for complex tasks requiring large-scale context or multimedia processing.

### When to Use
Use this skill for tasks involving long-form conversations (up to 1M tokens), multimodal data (e.g., text + images), or dynamic function calls. Ideal for code generation, data grounding, or API-based workflows in applications like chatbots, content analysis, or automated scripting. Avoid it for simple text-only tasks where lighter models suffice.

### Key Capabilities
- Multimodal support: Process text, images, and audio via the Gemini API; e.g., send an image URL with text for analysis.
- Long context: Handle up to 1M tokens for extended conversations; specify context in requests to maintain state.
- Function calling: Define and call external functions dynamically; use the API's tools parameter to specify functions.
- Grounding: Integrate real-time data fetching for accurate responses; enable via the grounding config in requests.
- Code execution: Generate and execute code snippets; ensure safe execution by wrapping in try-catch blocks.
- API endpoints: Primary endpoint is `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent` for text generation.

### Usage Patterns
To use this skill, first set the API key via environment variable (`export GEMINI_API_KEY=your_key`). Then, invoke it in OpenClaw by referencing the skill ID ("gemini") in your agent prompt. For API calls, structure requests as JSON payloads with authentication in the header. Pattern: Load the skill, prepare input data (e.g., multimodal array), send the request, and parse the response. Always check for rate limits by monitoring API responses. For repeated use, cache responses or use streaming for long contexts.

### Common Commands/API
- API Request: Use HTTP POST to `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent` with header `Authorization: Bearer $GEMINI_API_KEY`.
- Example CLI via curl: `curl -X POST -H "Authorization: Bearer $GEMINI_API_KEY" -H "Content-Type: application/json" -d '{"contents": [{"parts": [{"text": "Hello"}]}]}' https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent`
- Function Calling: In payload, add `"tools": [{"functionDeclarations": [...]}]` to define functions; call with `"parts": [{"functionCall": {"name": "functionName", "args": {}}}]`.
- Code Snippet for Python integration:
  ```
  import requests
  response = requests.post('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', headers={'Authorization': f'Bearer {os.environ["GEMINI_API_KEY"]}'}, json={'contents': [{'parts': [{'text': 'Generate code for a simple server'}]}]})
  print(response.json())
  ```
- Config Format: Use JSON for requests, e.g., `{"contents": [{"parts": [{"text": "Prompt"}, {"inlineData": {"mimeType": "image/jpeg", "data": "base64encodedimage"}}]}]` for multimodal.

### Integration Notes
Integrate by loading the skill in OpenClaw with `skill load gemini`. Authentication requires setting `$GEMINI_API_KEY` as an environment variable; do not hardcode keys. For cluster integration (e.g., "community"), reference via OpenClaw's graph: `skill link gemini to other_skill`. Handle multimodal inputs by encoding files (e.g., base64 for images) and including in the "parts" array. Test locally with the Google AI SDK if available, but use direct API calls for production. Ensure your OpenClaw agent has network access for outbound requests.

### Error Handling
Check HTTP status codes: 401 for auth issues (verify `$GEMINI_API_KEY`), 429 for rate limits (add retry logic with exponential backoff). Parse API errors from the response body, e.g., if "code" is 4, handle invalid input by validating prompts before sending. In code, wrap calls like:
  ```
  try:
      response = requests.post(...)  # API call
      if response.status_code != 200:
          raise Exception(response.json()['error']['message'])
  except Exception as e:
      print(f"Error: {e} - Retrying in 5 seconds")
      time.sleep(5)
  ```
Always log errors with context (e.g., prompt details) for debugging. For Gemini-specific errors, refer to Google's API docs for codes like "INVALID_ARGUMENT".

### Graph Relationships
- Related to: "google" (shares API ecosystem), "ai" (common AI capabilities), "multimodal" (overlaps with vision/image skills).
- Connected via: "community" cluster (links to other community skills like openai for comparative use).
- Dependencies: Requires external API access; no direct skill dependencies in OpenClaw graph.
