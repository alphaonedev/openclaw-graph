---
name: monday
cluster: community
description: "Monday.com: boards, items, columns, automations, integrations, dashboards, timeline, API"
tags: ["monday","boards","project","automation"]
dependencies: []
composes: []
similar_to: []
called_by: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "monday board item column automation dashboard timeline api"
---

# monday

## Purpose
This skill enables interaction with Monday.com's API for managing boards, items, columns, automations, integrations, dashboards, and timelines. Use it to automate project management tasks, query data, or integrate with other tools via the API.

## When to Use
- When you need to programmatically create or update Monday.com boards and items for project tracking.
- For automating workflows, such as triggering actions based on board changes or integrating with external services.
- In scenarios requiring data extraction from dashboards or timelines for reporting or analysis.

## Key Capabilities
- Create, read, update, and delete (CRUD) operations on boards, items, and columns.
- Manage automations and integrations via API calls.
- Access and manipulate dashboards and timelines for visualization and scheduling.
- Handle API queries for real-time data, including filtering and pagination.
- Support for webhooks to react to events like item creation or updates.

## Usage Patterns
Always initialize with authentication using the `$MONDAY_API_KEY` environment variable. Make API requests via HTTP clients like `requests` in Python. Structure calls as JSON payloads with required fields. For example, wrap API calls in try-except blocks for error handling. Use rate limiting by checking Monday.com's API docs for thresholds (e.g., 100 requests/min). Common pattern: Authenticate once, then chain multiple API calls in a session.

## Common Commands/API
Use Monday.com's REST API with base URL `https://api.monday.com/v2`. Set the Authorization header with `Authorization: YOUR_API_KEY`. Here's how to query boards:

Endpoint: GET /v2/boards  
Code snippet:  
```python
import requests  
headers = {'Authorization': os.environ['MONDAY_API_KEY']}  
response = requests.get('https://api.monday.com/v2/boards', headers=headers)  
print(response.json())
```

To create an item on a board:  
Endpoint: POST /v2/pulses  
Payload: {"query": 'mutation { create_item (board_id: 123456, item_name: "New Task") { id } }'}  
Code snippet:  
```python
import requests  
headers = {'Authorization': os.environ['MONDAY_API_KEY'], 'Content-Type': 'application/json'}  
data = {"query": 'mutation { create_item (board_id: 123456, item_name: "New Task") { id } }'}  
response = requests.post('https://api.monday.com/v2', headers=headers, json=data)  
print(response.json()['data']['create_item']['id'])
```

For updating a column:  
Endpoint: POST /v2  
Query: mutation { change_column_value (board_id: 123456, item_id: 654321, column_id: "status", value: "\"Done\"") { id } }  
Use flags like `board_id` and `item_id` in queries for specificity.

## Integration Notes
Store your API key in `$MONDAY_API_KEY` for secure access; never hardcode it. Integrate with other tools by setting up webhooks (e.g., POST to a custom endpoint on item creation). For OAuth, use Monday.com's flow if needed, but API key suffices for most CLI/API uses. Config format: JSON for payloads, e.g., {"query": "your_graphql_query"}. When integrating with services like Zapier, reference Monday.com's webhook events (e.g., "item_created"). Ensure your app handles CORS if building a web interface.

## Error Handling
Check response status codes: 200 for success, 401 for unauthorized (verify `$MONDAY_API_KEY`), 429 for rate limit (add retry logic with exponential backoff). Parse JSON errors for details, e.g., if "errors" key exists, log the message like "Invalid board_id". Use try-except in code:  
```python
try:  
    response = requests.get(url, headers=headers)  
    response.raise_for_status()  
except requests.exceptions.HTTPError as err:  
    print(f"Error: {err.response.status_code} - {err.response.json()['errors']}")
```
Handle common issues like invalid IDs by validating inputs before API calls.

## Concrete Usage Examples
1. **Create a new board and add an item:** First, authenticate with `$MONDAY_API_KEY`. Use the POST /v2 endpoint to create a board: `mutation { create_board (board_name: "My Project") { id } }`. Then, add an item: `mutation { create_item (board_id: <new_board_id>, item_name: "Task 1") { id } }`. This automates board setup for a new project.
2. **Query items and update a column:** Fetch items from a board using GET /v2/boards/{board_id}/items. Filter with query params like `limit=50`. Then, update a status column: `mutation { change_column_value (board_id: 123456, item_id: 654321, column_id: "status", value: "\"In Progress\"") }`. Useful for daily status updates in automations.

## Graph Relationships
- Related to: boards (parent), items (child), columns (attribute)
- Integrates with: automations (triggers), integrations (external links), dashboards (visualizations), timeline (scheduling)
- Connected via: API endpoints for data flow, webhooks for event-driven interactions
