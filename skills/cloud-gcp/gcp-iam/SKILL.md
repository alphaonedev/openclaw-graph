---
name: gcp-iam
cluster: cloud-gcp
description: "Manages identity and access control for Google Cloud resources using IAM policies and roles."
tags: ["gcp","iam","access-control"]
dependencies: []
composes: []
similar_to: []
called_by: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "gcp iam access management policies roles permissions google cloud security"
---

# gcp-iam

## Purpose
This skill handles identity and access management for Google Cloud Platform (GCP) resources by managing IAM policies, roles, and permissions. It enables programmatic control over who can access what resources, ensuring secure operations.

## When to Use
Use this skill when you need to dynamically assign or revoke access to GCP resources, such as granting admin rights to a service account, auditing permissions, or enforcing least-privilege access in applications. It's ideal for automation scripts, CI/CD pipelines, or when integrating with other GCP services.

## Key Capabilities
- Grant or revoke roles on resources using IAM policies.
- List and test permissions for users, groups, or service accounts.
- Manage custom roles via the IAM API.
- Handle resource-level policies for projects, buckets, or VMs.
- Support for predefined roles like roles/viewer or roles/editor.

## Usage Patterns
To use this skill, authenticate with GCP first by setting the `$GOOGLE_APPLICATION_CREDENTIALS` environment variable to your service account JSON key file. Invoke via gcloud CLI or Google Cloud IAM API. For example, in a script, check if a user has a role before proceeding, then apply changes. Always specify the project ID in commands to avoid scope errors. Use try-catch blocks in code for API calls to handle failures gracefully.

## Common Commands/API
Use the gcloud CLI for quick operations or the REST API for programmatic access. Key commands:
- `gcloud projects get-iam-policy [PROJECT_ID]` to retrieve a project's IAM policy.
- `gcloud iam roles describe [ROLE_ID] --project=[PROJECT_ID]` to view role details, including flags like `--format=json` for structured output.
API endpoints:
- GET https://iam.googleapis.com/v1/projects/{project}/iamPolicy to fetch policies.
- POST https://iam.googleapis.com/v1/projects/{project}:setIamPolicy with a JSON body like {"policy": {"bindings": [{"role": "roles/viewer", "members": ["user:example@example.com"]}]}.
Code snippet for adding a binding:
```python
from googleapiclient import discovery
iam_service = discovery.build('iam', 'v1')
policy = iam_service.projects().getIamPolicy(resource='projects/my-project').execute()
policy['bindings'].append({"role": "roles/editor", "members": ["user:alice@example.com"]})
```
Config format: IAM policies are JSON objects with "bindings" arrays, e.g., {"bindings": [{"role": "roles/owner", "members": ["serviceAccount:sa@project.iam.gserviceaccount.com"]}]}.

## Integration Notes
Integrate by exporting `$GOOGLE_APPLICATION_CREDENTIALS` as the path to your JSON key, e.g., `export GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json`. For multi-service apps, chain with other GCP skills like storage or compute by passing resource IDs. Use libraries like google-auth for token handling. In containers, mount the key file and set the env var. Avoid hardcoding keys; use IAM roles for EC2-like equivalents in GCP (e.g., via Compute Engine metadata server).

## Error Handling
Common errors include authentication failures (e.g., 401 Unauthorized) from invalid credentials—check `$GOOGLE_APPLICATION_CREDENTIALS` and ensure the service account has the iam.roles.get permission. For permission denied (403), verify the role bindings. Handle API errors by catching exceptions in code, e.g.:
```python
try:
    response = iam_service.projects().getIamPolicy(resource='projects/my-project').execute()
except HttpError as err:
    print(f"Error: {err.resp.status} - {err.content}")
```
Use `gcloud config set` to fix configuration issues, and always include `--project` flags to avoid "project not specified" errors. Log detailed error messages for debugging.

## Concrete Usage Examples
1. **Grant a role to a user on a project**: First, set auth with `export GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json`. Then, run `gcloud projects add-iam-policy-binding my-project --member="user:alice@example.com" --role="roles/editor"`. This adds the editor role; verify with `gcloud projects get-iam-policy my-project`.
2. **List and remove a binding for a service account**: Use the API: 
```python
iam_service = discovery.build('iam', 'v1')
policy = iam_service.projects().getIamPolicy(resource='projects/my-project').execute()
# Remove binding
policy['bindings'] = [b for b in policy['bindings'] if 'serviceAccount:sa@project.iam.gserviceaccount.com' not in b.get('members', [])]
iam_service.projects().setIamPolicy(resource='projects/my-project', body={'policy': policy}).execute()
```
This removes the service account from all bindings.

## Graph Relationships
- Related to cluster: cloud-gcp (e.g., shares dependencies with gcp-storage, gcp-compute skills).
- Linked via tags: gcp (connects to other GCP-related skills), iam (ties to access-control and security skills), access-control (integrates with broader security tools).
