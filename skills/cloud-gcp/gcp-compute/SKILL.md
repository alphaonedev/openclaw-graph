---
name: gcp-compute
cluster: cloud-gcp
description: "Manage virtual machines and compute resources on Google Cloud Platform\'s Compute Engine."
tags: ["gcp","compute-engine","virtual-machines"]
dependencies: []
composes: []
similar_to: []
called_by: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "gcp compute engine vm instances cloud"
---

# gcp-compute

## Purpose
This skill enables management of virtual machines (VMs) and compute resources on Google Cloud Platform's Compute Engine, including creating, configuring, and deleting instances.

## When to Use
Use this skill when provisioning scalable compute resources, such as VMs for web servers, batch processing, or testing environments. Apply it in scenarios requiring dynamic scaling, like auto-scaling groups, or when integrating with other GCP services for hybrid cloud setups.

## Key Capabilities
- Create and delete VM instances with custom machine types, zones, and images.
- Start, stop, and restart instances for resource optimization.
- Manage attached disks, networks, and firewalls via instance metadata.
- List and filter instances based on labels, zones, or status.
- Resize instances or update configurations without downtime where possible.
- Handle snapshots and images for backup and migration.

## Usage Patterns
Invoke this skill via gcloud CLI for quick operations, or integrate with Google Cloud SDK in Python scripts. Always authenticate first using environment variables. For automation, use loops to manage multiple instances, e.g., create a fleet based on user input. Pattern: Authenticate -> Select project/zone -> Perform action -> Verify state.

## Common Commands/API
Use gcloud CLI or Compute Engine API. Set authentication with `$GOOGLE_APPLICATION_CREDENTIALS` pointing to a service account JSON key.

- **Create an instance:**
  ```
  gcloud compute instances create my-vm --zone=us-central1-a --machine-type=e2-medium --image-family=debian-11 --image-project=debian-cloud
  ```
  API endpoint: POST https://compute.googleapis.com/compute/v1/projects/[PROJECT_ID]/zones/[ZONE]/instances

- **List instances:**
  ```
  gcloud compute instances list --filter="status:RUNNING" --project=[PROJECT_ID]
  ```
  API endpoint: GET https://compute.googleapis.com/compute/v1/projects/[PROJECT_ID]/zones/[ZONE]/instances

- **Delete an instance:**
  ```
  gcloud compute instances delete my-vm --zone=us-central1-a --quiet
  ```
  API endpoint: DELETE https://compute.googleapis.com/compute/v1/projects/[PROJECT_ID]/zones/[ZONE]/instances/[INSTANCE_NAME]

- **Start an instance:**
  ```
  gcloud compute instances start my-vm --zone=us-central1-a
  ```
  Config format: Instance metadata in JSON, e.g., {"labels": {"env": "prod"}}

For API calls, use the Google Cloud Client Library in Python:
```
from google.cloud import compute_v1
client = compute_v1.InstancesClient()
request = compute_v1.InsertInstanceRequest(...)
response = client.insert(request)
```

## Integration Notes
Integrate by setting `$GOOGLE_APPLICATION_CREDENTIALS` to the path of your service account key file. Use with other GCP services like Cloud Storage for boot disks or Pub/Sub for event-driven scaling. For Kubernetes, link via GKE nodes. Example: In a script, import the SDK and handle multi-project setups with `--project` flag. Ensure IAM roles like "compute.instanceAdmin.v1" are assigned for full access.

## Error Handling
Check for common errors like "Permission denied" (missing IAM roles; add via gcloud projects add-iam-policy-binding), "Resource not found" (verify instance/zone names), or "Quota exceeded" (request quota increase). Use try-except in scripts:
```
try:
    result = client.insert(request)
except google.api_core.exceptions.Forbidden as e:
    print("Error: Insufficient permissions. Check IAM roles.")
    # Retry after fixing
```
Always include `--quiet` for non-interactive deletes to avoid prompts, and use `--format=json` for parseable output in automation.

## Usage Examples
1. **Create and start a VM for a web server:**
   First, ensure authentication: export GOOGLE_APPLICATION_CREDENTIALS="/path/to/key.json". Then, run: gcloud compute instances create web-server-vm --zone=us-west1-b --machine-type=n1-standard-1 --image=ubuntu-2004-lts --tags=http-server. Verify: gcloud compute instances list. This sets up a basic VM; add firewall rules separately.

2. **Scale down by deleting idle instances:**
   List idle instances: gcloud compute instances list --filter="status:STOPPED". Delete: gcloud compute instances delete idle-vm-1 --zone=us-central1-a. In a script: Use a loop to delete based on filters, e.g., for instance in instances: if instance.status == 'STOPPED': client.delete(...). This optimizes costs by removing unused resources.

## Graph Relationships
- Related cluster: cloud-gcp
- Related tags: gcp, compute-engine, virtual-machines
- Connected skills: Links to other GCP skills like gcp-storage for disk management or gcp-networking for VPC integration.
