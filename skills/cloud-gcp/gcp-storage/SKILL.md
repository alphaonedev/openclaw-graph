---
name: gcp-storage
cluster: cloud-gcp
description: "Interact with Google Cloud Storage to manage buckets, objects, and access controls for scalable data storage."
tags: ["gcp-storage","cloud-storage","gcs"]
dependencies: []
composes: []
similar_to: []
called_by: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "gcp storage bucket object file upload download lifecycle"
---

# gcp-storage

## Purpose
This skill enables interaction with Google Cloud Storage (GCS) for managing buckets, objects, and access controls, providing scalable data storage solutions via the GCS API or gsutil CLI.

## When to Use
Use this skill when you need to store, retrieve, or manage large-scale unstructured data in the cloud, such as backing up files, hosting static websites, or handling data lakes. It's ideal for applications requiring durability and global accessibility, like data archiving or media storage, especially within GCP ecosystems.

## Key Capabilities
- Create and delete buckets using GCS API or gsutil.
- Upload, download, and delete objects with support for resumable transfers.
- Manage access controls via ACLs or IAM policies.
- Configure lifecycle policies for automatic object management (e.g., expiration rules).
- Handle metadata and versioning for objects.

## Usage Patterns
Always authenticate first by setting the environment variable `GOOGLE_APPLICATION_CREDENTIALS` to the path of your service account JSON key (e.g., `export GOOGLE_APPLICATION_CREDENTIALS="/path/to/key.json"`). Use gsutil for CLI operations or the GCS client library in code. For scripts, wrap operations in try-except blocks to handle transient errors. Start with listing buckets to verify access, then perform actions like uploading files. For API calls, use HTTP requests with OAuth 2.0 tokens obtained via the Google Auth library.

## Common Commands/API
Use gsutil for quick CLI tasks or the GCS JSON API for programmatic access. Set up authentication via `$GOOGLE_APPLICATION_CREDENTIALS`.

- **Create a bucket**:  
  `gsutil mb gs://my-bucket/`  
  Or API: POST https://storage.googleapis.com/storage/v1/b?project=my-project with JSON body: {"name": "my-bucket"}

- **Upload an object**:  
  `gsutil cp localfile.txt gs://my-bucket/`  
  Or in Python:  
  ```python
  from google.cloud import storage
  client = storage.Client()
  bucket = client.bucket('my-bucket')
  blob = bucket.blob('localfile.txt')
  blob.upload_from_filename('localfile.txt')
  ```

- **List objects in a bucket**:  
  `gsutil ls gs://my-bucket/`  
  Or API: GET https://storage.googleapis.com/storage/v1/b/my-bucket/o

- **Delete an object**:  
  `gsutil rm gs://my-bucket/object.txt`  
  Or in Python:  
  ```python
  blob = bucket.blob('object.txt')
  blob.delete()
  ```

- **Set ACL for an object**:  
  `gsutil acl ch -u user@example.com:R gs://my-bucket/object.txt`  
  Or API: PATCH https://storage.googleapis.com/storage/v1/b/my-bucket/o/object.txt with body: {"acl": [{"entity": "user-user@example.com", "role": "READER"}]}
  
Include flags like `-m` for multi-threaded operations (e.g., `gsutil -m cp dir/* gs://my-bucket/`) or `--quiet` to suppress output.

## Integration Notes
Integrate GCS with applications by using the Google Cloud client library in languages like Python or Java. For config, provide a service account key via `$GOOGLE_APPLICATION_CREDENTIALS` or use Application Default Credentials in GCP environments. In Kubernetes, mount the key as a secret and set the env var. For web apps, use signed URLs for temporary access (e.g., generate with `blob.generate_signed_url()`). Ensure your project ID is specified in API calls (e.g., via `storage.Client(project='my-project')`). Avoid hardcoding keys; use IAM roles for secure access.

## Error Handling
Check for common errors like authentication failures (e.g., "401 Unauthorized" – ensure `$GOOGLE_APPLICATION_CREDENTIALS` is set correctly) or bucket not found (e.g., "404" – verify bucket name). Use try-except in code:  
```python
try:
    blob.upload_from_filename('file.txt')
except google.cloud.exceptions.NotFound:
    print("Bucket does not exist; create it first.")
```  
For CLI, parse output or use `--debug` flag (e.g., `gsutil cp file.txt gs://bucket/ --debug=2`). Handle rate limits with exponential backoff; retry transient errors like 429 using libraries like `tenacity`. Always validate inputs, such as checking if the file exists before uploading.

## Concrete Usage Examples
1. **Upload a file and set metadata**: First, authenticate with `export GOOGLE_APPLICATION_CREDENTIALS="/path/to/key.json"`. Then, run `gsutil cp localfile.txt gs://my-bucket/` followed by `gsutil setmeta -h "x-goog-meta-key:value" gs://my-bucket/localfile.txt`. In code:  
   ```python
   blob = bucket.blob('localfile.txt')
   blob.metadata = {'key': 'value'}
   blob.upload_from_filename('localfile.txt')
   ```
   This uploads a file and adds custom metadata for tracking.

2. **Manage lifecycle policy**: Create a bucket if needed with `gsutil mb gs://my-lifecycle-bucket/`. Then, apply a policy: `gsutil lifecycle set lifecycle.json gs://my-lifecycle-bucket/` where lifecycle.json is:  
   ```json
   {"rule":[{"action":{"type":"Delete"},"condition":{"age":30}}]}
   ```  
   This automatically deletes objects older than 30 days. Monitor with `gsutil ls -l gs://my-lifecycle-bucket/` to verify.

## Graph Relationships
- Related to: cloud-gcp (cluster), as it shares authentication and project contexts.
- Connected to: gcp-compute (for VM-based data processing), gcp-networking (for VPC access controls).
- Links with: Other storage skills if available, via shared GCP APIs.
