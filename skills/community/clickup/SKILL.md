---
name: clickup
cluster: community
description: "ClickUp: tasks, spaces, lists, docs, goals, dashboards, automation, time tracking, API"
tags: ["clickup","tasks","project","productivity"]
dependencies: []
composes: []
similar_to: []
called_by: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "clickup task space list doc goal dashboard automation api"
---

# clickup

## Purpose
This skill allows the AI to interact with ClickUp's API for managing project tasks, spaces, lists, documents, goals, dashboards, automation, time tracking, and integrations. Use it to automate workflows by fetching or updating ClickUp data programmatically.

## When to Use
Use this skill when handling productivity tasks in code, such as syncing tasks with other apps, generating reports from ClickUp data, automating task creation based on events, or integrating with CI/CD pipelines. Apply it in scripts for project management automation or when real-time updates are needed, like in chatbots or monitoring tools.

## Key Capabilities
- Manage tasks via API endpoints like POST /api/v2/list/{list_id}/task to create tasks.
- Handle spaces and lists with GET /api/v2/team/{team_id}/space to retrieve spaces.
- Access documents and goals using GET /api/v2/folder/{folder_id}/doc for docs.
- Track time with endpoints like POST /api/v2/task/{task_id}/time_entry.
- Automate workflows via ClickUp's automation rules, queried through GET /api/v2/space/{space_id}/automation.
- Use dashboards with GET /api/v2/team/{team_id}/dashboard.
- All operations require authentication via Bearer token in the Authorization header.
- Supports pagination for large datasets, e.g., via query params like ?page=1&limit=50.

## Usage Patterns
Always authenticate requests with the API token stored in an environment variable, e.g., `$CLICKUP_API_TOKEN`. Use HTTP libraries like requests in Python to make calls. For example, construct requests with base URL https://api.clickup.com/api/v2, and handle JSON payloads. Pattern: First, fetch team ID with GET /api/v2/team, then use it to access nested resources. If rate-limited, implement exponential backoff. For CLI integration, pipe outputs to tools like jq for parsing JSON responses.

## Common Commands/API
- Create a task: Use POST /api/v2/list/{list_id}/task with JSON body {"name": "New Task", "description": "Details"}. Example in Python:
  ```python
  import requests; token = os.environ['CLICKUP_API_TOKEN']
  response = requests.post('https://api.clickup.com/api/v2/list/123/task', headers={'Authorization': token}, json={'name': 'Task'})
  ```
- Get tasks in a list: GET /api/v2/list/{list_id}/task?subtasks=true. CLI example: `curl -H "Authorization: $CLICKUP_API_TOKEN" https://api.clickup.com/api/v2/list/456/task`.
- Update a task: PUT /api/v2/task/{task_id} with body {"status": "in progress"}. Snippet:
  ```python
  requests.put('https://api.clickup.com/api/v2/task/789', headers={'Authorization': token}, json={'status': 'complete'})
  ```
- Fetch spaces: GET /api/v2/team/{team_id}/space. Config format: Store team ID in a .env file as CLICKUP_TEAM_ID=123.
- Time tracking: POST /api/v2/task/{task_id}/time_entry with {"start": "2023-01-01T00:00:00Z"}.

## Integration Notes
Set up authentication by exporting `$CLICKUP_API_TOKEN` from your ClickUp account settings. For integrations, use ClickUp's webhooks (e.g., subscribe via POST /api/v2/webhook) and handle incoming payloads in your app. When integrating with other services, map ClickUp IDs (e.g., task IDs) to external keys. Config format: Use a JSON config file like {"api_base": "https://api.clickup.com/api/v2", "team_id": "123"}. Avoid hardcoding tokens; always use env vars. For OAuth, redirect users to ClickUp's auth flow if needed, but for API access, stick to token-based auth.

## Error Handling
Check HTTP status codes: 401 for unauthorized (retry with fresh token), 429 for rate limit (wait and retry with backoff), 404 for not found (log and skip). Parse JSON errors, e.g., if response.json()['err'] == 'Access denied', raise a custom exception. In code, wrap requests in try-except blocks: 
  ```python
  try: response = requests.get(url, headers={'Authorization': token})
  except requests.exceptions.RequestException as e: print(f"Error: {e}, Status: {response.status_code}")
  ```
Handle pagination errors by checking for 'next_page' in responses. Validate inputs, like ensuring list_id is an integer before API calls.

## Concrete Usage Examples
1. Automate task creation: When a user requests a new task via chat, use this skill to create it in ClickUp. Example: In a script, parse user input, then call POST /api/v2/list/123/task with the task details. Code: 
   ```python
   task_data = {'name': 'User-reported issue', 'description': user_input}
   requests.post('https://api.clickup.com/api/v2/list/123/task', headers={'Authorization': $CLICKUP_API_TOKEN}, json=task_data)
   ```
   This integrates with messaging apps for real-time task management.

2. Fetch and report on tasks: To generate a daily summary, query tasks in a space and filter by status. Example: Use GET /api/v2/space/456/task?status=active, then process the response to count open tasks. Code:
   ```python
   response = requests.get('https://api.clickup.com/api/v2/space/456/task', headers={'Authorization': $CLICKUP_API_TOKEN})
   tasks = response.json()['tasks']; open_tasks = [t for t in tasks if t['status']['status'] == 'active']
   print(f"Open tasks: {len(open_tasks)}")
   ```
   This is useful for dashboard updates or alerts in productivity tools.

## Graph Relationships
- Related to cluster: community (e.g., links to other community tools like GitHub or Trello skills).
- Tagged with: clickup (direct match), tasks (connects to project management skills), project (links to Jira or Asana equivalents), productivity (associates with time-tracking or automation skills).
