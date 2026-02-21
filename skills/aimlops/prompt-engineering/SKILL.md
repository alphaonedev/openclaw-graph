---
name: prompt-engineering
cluster: aimlops
description: "Crafting effective prompts for AI models to optimize outputs and performance."
tags: ["ai","ml","nlp","prompts"]
dependencies: []
composes: []
similar_to: []
called_by: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "prompt engineering ai ml nlp optimization"
---

## prompt-engineering

### Purpose
This skill enables OpenClaw to craft and optimize prompts for AI models, improving output quality, accuracy, and efficiency in tasks like text generation, classification, or code completion. It uses techniques such as chain-of-thought prompting and few-shot learning to fine-tune interactions with LLMs.

### When to Use
Use this skill when AI outputs are suboptimal, such as vague responses, hallucinations, or poor performance in NLP tasks. Apply it for model fine-tuning, debugging AI behavior, or integrating prompts into applications like chatbots or automated content generators.

### Key Capabilities
- Generate prompt templates with variables (e.g., `{input_text}`) for dynamic reuse.
- Optimize prompts using metrics like perplexity or response length via built-in analyzers.
- Support for popular models like GPT-4 or BERT through adapters.
- Iterative refinement: Automatically suggest variations based on feedback loops.
- Integration with embedding services for semantic similarity checks using the provided embedding hint.

### Usage Patterns
Always start with a base prompt and iterate: 1) Define the prompt structure, 2) Test with sample inputs, 3) Analyze outputs, 4) Refine using optimization flags. For CLI, chain commands like `openclaw prompt create` followed by `openclaw prompt test`. In code, wrap prompts in functions for modular reuse. Use JSON config files for complex setups, e.g., specify `"model": "gpt-4"` and `"temperature": 0.7`.

### Common Commands/API
Use the OpenClaw CLI for quick operations; authenticate via `$OPENCLAW_API_KEY` environment variable. For API, send requests to `https://api.openclaw.ai/v1/prompts` with JSON payloads.

- CLI Command: Create a prompt  
  `openclaw prompt create --name myPrompt --template "Summarize {text} in 50 words" --model gpt-4`  
  This generates a reusable prompt template.

- CLI Command: Test and optimize a prompt  
  `openclaw prompt test --prompt-id 123 --input "Long article text here" --optimize perplexity`  
  Runs the prompt and applies optimization based on the specified metric.

- API Endpoint: Create prompt (POST to /v1/prompts)  
  Headers: `Authorization: Bearer $OPENCLAW_API_KEY`  
  Body: `{"name": "myPrompt", "template": "Translate {text} to French", "model": "gpt-4"}`  
  Response includes a prompt ID for future references.

- Code Snippet: Basic prompt execution in Python  
  ```python  
  import openclaw  
  client = openclaw.Client(api_key=os.environ['OPENCLAW_API_KEY'])  
  response = client.prompts.execute(prompt_id='123', input_data={'text': 'Hello world'})
  ```

### Integration Notes
Integrate this skill by loading prompts into other OpenClaw skills or external tools. For example, reference a prompt ID in a workflow config file like:  
`{ "skill": "prompt-engineering", "prompt_id": "123", "dependencies": ["aimlops/data-processing"] }`  
When combining with services like Hugging Face, use the embedding hint in queries, e.g., pass `"embedding_hint": "prompt engineering ai ml nlp optimization"` to match related vectors. Ensure API keys are set as env vars (e.g., `$HUGGINGFACE_API_KEY`) for cross-service calls. Always validate prompt outputs against schemas to prevent injection risks.

### Error Handling
Common errors include authentication failures (e.g., 401 Unauthorized: ensure `$OPENCLAW_API_KEY` is set and valid), invalid prompt structures (e.g., missing variables: use `openclaw prompt validate --id 123` to check), or model timeouts (e.g., rate limits: retry with exponential backoff). For API errors, parse the response JSON for codes like "error_code": "INVALID_TEMPLATE" and fix by editing the template string. In code, wrap calls in try-except blocks:  
```python  
try:  
    response = client.prompts.execute(...)  
except openclaw.errors.AuthenticationError:  
    print("Set $OPENCLAW_API_KEY and retry")
```

### Concrete Usage Examples
1. **Text Summarization Prompt**: To summarize articles, create a prompt with: `openclaw prompt create --name summaryPrompt --template "Summarize the following text: {text} in under 100 words" --model gpt-4`. Then test: `openclaw prompt test --prompt-id <returned_id> --input "This is a long article about AI..."`. This yields a concise summary; iterate by adding `--optimize length` if outputs are too verbose.

2. **Code Generation Prompt**: For generating Python functions, use: `openclaw prompt create --name codePrompt --template "Write a Python function that {task_description}" --model gpt-4`. Execute with: `openclaw prompt test --prompt-id <id> --input "sorts a list of numbers"`. Refine by checking for syntax errors and re-running with variations like `--template "Write secure Python function that {task_description}"` to add safety.

### Graph Relationships
- Related to cluster: aimlops (e.g., shares dependencies with data-processing and model-training skills).
- Connected via tags: ai (links to general AI tools), ml (integrates with machine learning workflows), nlp (direct overlap for language tasks), prompts (core relation to prompt optimization skills).
- Embedding relationships: Uses embedding hint for semantic links, e.g., to nlp-processing skill for vector-based prompt enhancements.
