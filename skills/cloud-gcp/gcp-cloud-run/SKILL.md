---
name: gcp-cloud-run
cluster: cloud-gcp
description: "Deploy and manage stateless containers on Google\'s serverless platform for scalable web applications."
tags: ["gcp","cloud-run","serverless"]
dependencies: []
composes: []
similar_to: []
called_by: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "gcp cloud run serverless containers deployment scaling gcp services"
---

# gcp-cloud-run

## Purpose
This skill enables deploying and managing stateless containers on Google Cloud Run, a serverless platform for running scalable web applications on GCP. It focuses on containerized workloads that handle HTTP requests without managing servers.

## When to Use
Use this skill for applications needing automatic scaling, such as REST APIs, web hooks, or microservices. Ideal when your app is stateless, requires pay-per-use pricing, and integrates with other GCP services. Avoid if you need persistent storage or long-running processes beyond Cloud Run's limits (e.g., >15 minutes execution).

## Key Capabilities
- Deploy containers from Docker images to Cloud Run services.
- Automatic scaling based on traffic, with limits configurable via CPU/memory settings.
- Support for HTTPS, custom domains, and environment variables for configuration.
- Integration with GCP services like Pub/Sub for event-driven workflows or Cloud SQL for databases.
- Real-time metrics via Cloud Monitoring, including request latency and error rates.

## Usage Patterns
To deploy an app, build a Docker image, then use gcloud CLI to create or update a service. For updates, redeploy with new image tags. Pattern for event-driven apps: Use Cloud Run with Pub/Sub triggers. For CI/CD, integrate with Cloud Build to automate deployments from source code.

## Common Commands/API
Authenticate first by setting `$GOOGLE_APPLICATION_CREDENTIALS` to your service account JSON key file.

- **Deploy a service**: Use `gcloud run deploy SERVICE-NAME --image gcr.io/PROJECT-ID/IMAGE-NAME --platform managed --region us-central1 --allow-unauthenticated`. This creates or updates a service with the specified image.
  
  Example code snippet:
  ```
  gcloud run deploy my-app --image gcr.io/my-project/my-image:latest
  --set-env-vars=PORT=8080
  ```

- **List services**: Run `gcloud run services list --region us-central1` to view all services in a region.

- **Invoke a service**: Use the API endpoint `https://REGION-run.googleapis.com/v1/namespaces/PROJECT-ID/services/SERVICE-NAME:invoke` with a POST request. Include headers like `Content-Type: application/json`.

- **Update configuration**: Command: `gcloud run services update SERVICE-NAME --set-cpu 1 --memory 512Mi --region us-central1`. This adjusts resources for the service.

- **API interactions**: Use the Cloud Run API; for example, to get service details, send a GET to `https://run.googleapis.com/v1/projects/PROJECT-ID/locations/REGION/services/SERVICE-NAME`. Authenticate requests with OAuth 2.0 tokens via `$GOOGLE_OAUTH_TOKEN`.

Config formats: Services use YAML for manifests, e.g., in Cloud Build:
```
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: my-service
spec:
  template:
    spec:
      containers:
      - image: gcr.io/my-project/my-image
```

## Integration Notes
Integrate Cloud Run with other GCP services by adding triggers or using environment variables. For Pub/Sub, set up a topic and subscribe your service; use `--set-env-vars=PUBSUB_TOPIC=projects/PROJECT-ID/topics/TOPIC-NAME` during deployment. For Cloud Storage, access via the Google Cloud Client Library in your code. In multi-service setups, use service URLs as dependencies, e.g., invoke another Cloud Run service via HTTP from your app code. Ensure IAM roles are set; grant `roles/run.invoker` to service accounts for cross-service calls.

## Error Handling
Common errors include authentication failures (e.g., "Permission denied"), resolved by running `gcloud auth login` and verifying `$GOOGLE_APPLICATION_CREDENTIALS`. For deployment issues like invalid images, check with `gcloud builds log`. Handle runtime errors in code; Cloud Run logs to Cloud Logging, so query with `gcloud logging read "resource.type=cloud_run_revision"`. If scaling fails due to quotas, use `gcloud compute project-info add-metadata --metadata quotas=KEY=VALUE` to request increases. Always wrap API calls in try-catch blocks, e.g.:

```
try {
  const response = await fetch('https://SERVICE-URL', { method: 'POST' });
  if (!response.ok) throw new Error('HTTP error ' + response.status);
} catch (error) {
  console.error('Invocation failed:', error);
}
```

## Concrete Usage Examples
1. **Deploy a simple Node.js app**: First, build and push your Docker image: `docker build -t gcr.io/my-project/my-app . && docker push gcr.io/my-project/my-app`. Then deploy: `gcloud run deploy my-app --image gcr.io/my-project/my-app --platform managed --region us-central1 --allow-unauthenticated`. Access the app at the provided URL.

2. **Update a service with environment variables**: If your app needs config changes, run: `gcloud run services update my-app --set-env-vars=API_KEY=$MY_API_KEY --region us-central1`. This updates the service in place without downtime, using the env var for sensitive data.

## Graph Relationships
- Related to cluster: cloud-gcp (e.g., links to gcp-pubsub, gcp-cloud-storage for integrations).
- Tagged with: gcp, cloud-run, serverless (connects to other serverless skills like aws-lambda in broader ecosystems).
