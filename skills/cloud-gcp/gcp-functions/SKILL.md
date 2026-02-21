---
name: gcp-functions
cluster: cloud-gcp
description: "Deploy and manage serverless functions on Google Cloud Platform using Cloud Functions for event-driven applications."
tags: ["gcp","serverless","functions"]
dependencies: []
composes: []
similar_to: []
called_by: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "gcp cloud functions serverless deployment triggers events"
---

# gcp-functions

## Purpose
This skill handles deploying and managing serverless functions on Google Cloud Platform (GCP) using Cloud Functions, focusing on event-driven applications like HTTP requests or Pub/Sub events.

## When to Use
Use this skill for scalable, event-based workloads, such as processing uploads in Cloud Storage, responding to API calls, or integrating with GCP services like Pub/Sub. Avoid it for long-running tasks; opt for Cloud Run instead.

## Key Capabilities
- Deploy functions in languages like Python, Node.js, or Go via `gcloud` CLI.
- Configure triggers: HTTP, Pub/Sub, Cloud Storage, or Firestore.
- Manage function settings: runtime (e.g., `--runtime python39`), memory (e.g., `--memory 256MB`), and environment variables.
- Handle versioning and traffic splitting for A/B testing.
- Integrate with GCP IAM for secure access control.

## Usage Patterns
To deploy a function: Authenticate with GCP using `$GOOGLE_APPLICATION_CREDENTIALS` env var, write code in a supported language, then use `gcloud` to deploy with specified triggers. For updates: Redeploy with `--update` flag. For invocation: Use HTTP endpoints or test via `gcloud functions call`. Always specify the project and region, e.g., set `gcloud config set project PROJECT_ID` first.

## Common Commands/API
Use `gcloud functions` for CLI operations. Key commands:
- Deploy: `gcloud functions deploy FUNCTION_NAME --runtime python39 --trigger-http --allow-unauthenticated`
- List functions: `gcloud functions list --project PROJECT_ID`
- Delete: `gcloud functions delete FUNCTION_NAME --quiet`
- Call: `gcloud functions call FUNCTION_NAME --data '{"key":"value"}'`
API endpoints (via REST):
- Deploy: POST https://cloudfunctions.googleapis.com/v1/projects/PROJECT_ID/locations/REGION/functions
  Example body: `{"name": "projects/PROJECT_ID/locations/REGION/functions/FUNCTION_NAME", "entryPoint": "handler", "runtime": "python39"}`
Config formats: Use `package.json` for Node.js or `requirements.txt` for Python in the function directory. Set env vars in deployment: `--set-env-vars KEY=VALUE`.

## Integration Notes
Integrate Cloud Functions with other GCP services by configuring triggers. For Pub/Sub: Set `--trigger-topic TOPIC_NAME`. For authentication, use service accounts via `$GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json`. To call from another service, ensure the function has an HTTP trigger and proper IAM roles (e.g., grant `roles/cloudfunctions.invoker`). For code, import GCP libraries: e.g., in Python, use `from google.cloud import pubsub_v1`. Always validate inputs to prevent injection risks.

## Error Handling
Common errors: "Permission denied" – Fix by checking IAM roles with `gcloud projects get-iam-policy PROJECT_ID` and adding necessary permissions. "Function failed to deploy" – Verify runtime compatibility and code syntax; use `gcloud functions logs read FUNCTION_NAME` for details. For timeout errors, increase the timeout with `--timeout 540s`. Handle runtime errors in code: e.g., wrap handlers in try-except and log with `import logging; logging.error("Error message")`. Retry transient failures using exponential backoff in your application logic.

## Concrete Usage Examples
Example 1: Deploy an HTTP-triggered function to echo a message.
```python
def hello_http(request):
    return "Hello World!"
```
Run: `gcloud functions deploy echo-function --runtime python39 --trigger-http --entry-point hello_http`

Example 2: Deploy a Pub/Sub-triggered function to process messages.
```python
import base64
def process_message(event, context):
    message = base64.b64decode(event['data']).decode('utf-8')
    print(message)
```
Run: `gcloud functions deploy process-pubsub --runtime python39 --trigger-topic my-topic --entry-point process_message`

## Graph Relationships
- Cluster: Related to "cloud-gcp" for other GCP services like storage or compute.
- Tags: Connected to "gcp" for general GCP skills, "serverless" for similar tools like AWS Lambda, and "functions" for function-as-a-service patterns.
