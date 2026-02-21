---
name: openai-api
cluster: ai-apis
description: "OpenAI API for GPT completions, function calling, assistants, embeddings, and more"
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

# openai-api

## Purpose
This skill provides direct access to the OpenAI API for tasks like generating text completions, handling function calls, managing assistants, and creating embeddings. It's designed for AI agents to integrate OpenAI's capabilities into workflows.

## When to Use
Use this skill when you need dynamic text generation (e.g., for chatbots), embeddings for semantic search, or function calling for tool integration. Apply it in scenarios requiring real-time AI responses, such as code generation, content summarization, or data analysis. Avoid it for simple tasks; reserve for complex AI-driven operations where OpenAI's models outperform local alternatives.

## Key Capabilities
- Text completions: Use the /completions endpoint for basic prompt-based generation with models like text-davinci-003.
- Chat completions: Leverage /chat/completions for conversational AI, supporting role-based messages and tools.
- Function calling: Enable tools via /chat/completions by defining functions in the request body for dynamic API interactions.
- Assistants: Manage custom assistants through /assistants endpoints for persistent AI agents with tools and files.
- Embeddings: Generate vector representations via /embeddings for applications like similarity search.
- Fine-tuning: Access /fine-tunes for customizing models, though this requires specific input formats like JSONL files.

## Usage Patterns
Always set the API key via environment variable: export OPENAI_API_KEY=your_api_key. Make requests to the base URL https://api.openai.com/v1/. For CLI or script usage, use tools like curl or OpenAI's SDK. Structure requests with JSON payloads, including parameters like model (e.g., gpt-3.5-turbo) and max_tokens (e.g., 150). Handle rate limits by implementing retry logic with exponential backoff. To use function calling, include a "tools" array in your request and check the response for "tool_calls".

## Common Commands/API
Interact via HTTP requests or the OpenAI SDK. For authentication, include the header: Authorization: Bearer $OPENAI_API_KEY. Key endpoints:
- For text completion: POST to /completions with body {"model": "text-davinci-003", "prompt": "Hello world", "max_tokens": 50}.
  Example snippet:
  ```
  curl https://api.openai.com/v1/completions \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model": "text-davinci-003", "prompt": "Explain AI"}'
  ```
- For chat completion: POST to /chat/completions with body {"model": "gpt-3.5-turbo", "messages": [{"role": "user", "content": "Hello"}], "tools": [...]}.
  Example snippet:
  ```
  curl https://api.openai.com/v1/chat/completions \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{"model": "gpt-3.5-turbo", "messages": [{"role": "user", "content": "Summarize this: AI is changing the world"}]}'
  ```
- For embeddings: POST to /embeddings with body {"model": "text-embedding-ada-002", "input": "Your text here"}.
  Example: Use in code as: response = openai.Embedding.create(model="text-embedding-ada-002", input="Hello")
- Config format: Requests often use JSON like {"temperature": 0.7, "top_p": 1} for controlling output randomness.

## Integration Notes
Integrate by importing the OpenAI SDK in your language (e.g., pip install openai for Python). Set up event-driven patterns, like triggering completions on user input. For function calling, define tools as a list of dictionaries (e.g., {"type": "function", "function": {"name": "get_weather", "parameters": {"location": "string"}}}). Ensure compatibility with other AI APIs by standardizing response formats. Use webhooks for assistants to handle asynchronous events. Test integrations with mock servers to avoid real API costs.

## Error Handling
Common errors include 429 (rate limit exceeded), 401 (unauthorized), and 400 (bad request). Check response status codes and parse error messages from the JSON body (e.g., {"error": {"message": "Invalid model", "type": "invalid_request_error"}}). Implement retry logic for transient errors: use a loop with time.sleep() for delays. For authentication failures, verify $OPENAI_API_KEY is set and not expired. Log errors with details like error code and message, then fallback to default responses or alternative skills.

## Graph Relationships
- Connected to cluster: ai-apis
- Related tags: ai-apis, api
- Potential links: Integrates with skills in the same cluster, such as other AI APIs for combined workflows; depends on authentication services for key management.
