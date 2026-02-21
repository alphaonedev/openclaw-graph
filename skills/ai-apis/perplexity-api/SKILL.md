---
name: perplexity-api
cluster: ai-apis
description: "Perplexity Sonar API for real-time web answers, citations, and search-augmented LLM."
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

# perplexity-api

## Purpose
This skill provides access to Perplexity's Sonar API, allowing real-time web searches, answers with citations, and search-augmented LLM responses to enhance AI-driven applications.

## When to Use
Use this skill for tasks requiring current web data, such as answering user queries with verifiable sources, augmenting LLM outputs with live information, or performing research that needs citations. Avoid it for static data or when real-time access isn't needed to prevent unnecessary API calls.

## Key Capabilities
- Perform real-time web searches with query parameters for filtering (e.g., by date or domain).
- Retrieve answers as JSON objects including text responses and citation URLs.
- Integrate with LLMs to generate search-augmented responses, combining API results with model inferences.
- Support for multiple query types: standard search, focused queries, and citation extraction.
- Rate limiting awareness, with up to 100 requests per minute per API key.

## Usage Patterns
Always set the API key via environment variable before invoking. Use HTTP GET or POST requests for queries, parse JSON responses, and handle asynchronous results if needed. For AI agents, integrate as a subroutine: first check local knowledge, then call this API for web updates. Pattern: Authenticate -> Send query -> Process response -> Log or cache results.

## Common Commands/API
Endpoint: https://api.perplexity.ai/search (GET for simple queries, POST for complex ones with JSON body).  
Authentication: Required; set via $PERPLEXITY_API_KEY (e.g., export PERPLEXITY_API_KEY=your_api_key).  
CLI Example:  
curl -H "Authorization: Bearer $PERPLEXITY_API_KEY" -G https://api.perplexity.ai/search --data-urlencode "q=latest AI news"  
API Parameters:  
- q: Required string for query (e.g., "climate change effects").  
- limit: Integer for result count (e.g., 5).  
- format: String for response format (e.g., "json" or "text").  
Code Snippet (Python):  
import requests; os.environ['PERPLEXITY_API_KEY'] = 'your_key'  
response = requests.get('https://api.perplexity.ai/search', params={'q': 'query'}, headers={'Authorization': f'Bearer {os.environ["PERPLEXITY_API_KEY"]}'}).json()  
print(response['answers'][0]['text'])  # Access first answer  
Config Format: Store in a .env file as PERPLEXITY_API_KEY=your_key, then load with python-dotenv.

## Integration Notes
Integrate by wrapping API calls in try-except blocks for reliability. For OpenClaw agents, use this skill in workflows where web data is needed: e.g., prepend API results to LLM prompts. Ensure compatibility with async frameworks if using; Perplexity API supports timeouts up to 30 seconds. Test with mock responses first. Pattern: Import necessary libraries (e.g., requests), set env vars, and call the endpoint with structured queries. Avoid direct exposure of API keys in code; use secure vaults or env vars exclusively.

## Error Handling
Check HTTP status codes: 401 for authentication failures (retry after verifying $PERPLEXITY_API_KEY); 429 for rate limits (implement exponential backoff, e.g., wait 5-10 seconds); 404 for invalid endpoints (log and fallback to alternative skills). Parse JSON errors for details like "error": "Invalid query". In code, use:  
try:  
    response = requests.get(...)  
    response.raise_for_status()  # Raises HTTPError for 4xx/5xx  
except requests.exceptions.HTTPError as e:  
    print(f"Error: {e.response.status_code} - {e.response.text}")  # Log and handle  
Always include retry logic with limits (e.g., max 3 retries) and inform the user if failures persist.

## Concrete Usage Examples
1. **Example: Real-time News Search**  
   To fetch the latest AI developments: Set $PERPLEXITY_API_KEY, then run curl -H "Authorization: Bearer $PERPLEXITY_API_KEY" -G https://api.perplexity.ai/search --data-urlencode "q=latest OpenAI updates&limit=3". In code: Import requests, query the endpoint, and extract citations like response['answers'][0]['source_url'] to display to the user. This is useful for agents responding to news queries.  
   
2. **Example: Augmenting LLM Responses**  
   For enhancing an LLM answer: First, get LLM output (e.g., "Summarize climate change"), then call the API with that as a query: requests.get('https://api.perplexity.ai/search', params={'q': 'climate change summary'}). Use the API's response to add citations, e.g., append "Source: [URL from response]" to the LLM text. In a workflow: If the agent's response needs verification, invoke this skill and merge results before final output.

## Graph Relationships
- Related to cluster: ai-apis (e.g., shares dependencies with other AI API skills like openai-api).
- Tagged with: ai-apis (indicates grouping for AI-related endpoints), api (general API integration).
- Connections: Can be chained with llm-tools for combined search and generation; conflicts with offline-data skills due to real-time dependency.
