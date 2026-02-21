---
name: gcp-vertexai
cluster: cloud-gcp
description: "Platform for building, deploying, and scaling machine learning models on Google Cloud."
tags: ["gcp","vertexai","machine-learning"]
dependencies: []
composes: []
similar_to: []
called_by: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "gcp vertex ai machine learning ml models deployment scaling"
---

# gcp-vertexai

## Purpose
This skill allows the AI agent to interact with Google Cloud's Vertex AI platform for managing machine learning workflows, including model building, training, deployment, and scaling. Use it to automate tasks like uploading models, running predictions, and monitoring resources.

## When to Use
Use this skill when working on GCP projects that involve ML model development, such as training custom models with AutoML, deploying endpoints for inference, or scaling ML operations. Apply it in scenarios requiring integration with other GCP services, like BigQuery for data or Compute Engine for resources.

## Key Capabilities
- Model training via Vertex AI Pipelines: Define and run pipelines for automated ML workflows.
- Deployment of models: Create endpoints for serving predictions at scale.
- Prediction services: Use online or batch predictions with low-latency responses.
- AutoML integration: Automate model selection and hyperparameter tuning.
- Monitoring and scaling: Track metrics and autoscaling of deployed models using Vertex AI's dashboard or APIs.

## Usage Patterns
To use Vertex AI, authenticate first by setting the environment variable `$GOOGLE_APPLICATION_CREDENTIALS` to your service account JSON key file. Then, interact via gcloud CLI for quick tasks or the Vertex AI SDK for programmatic control. For API calls, use the REST endpoints with HTTP requests. Always specify the project ID and region in commands to avoid scope errors. Example pattern: Initialize a client, create a resource, and handle the response in a try-except block.

## Common Commands/API
- CLI: Use `gcloud ai models upload --artifact-uri=gs://bucket/path --display-name=my-model --project=my-project` to upload a model from Cloud Storage.
- CLI: Train a model with `gcloud ai custom-jobs create --display-name=job-name --python-script-uri=gs://bucket/script.py --region=us-central1 --args=--arg1=value`.
- API Endpoint: Send requests to `https://us-central1-aiplatform.googleapis.com/v1/projects/{project-id}/locations/{location}/endpoints` for managing prediction endpoints.
- API Endpoint: For predictions, POST to `https://us-central1-aiplatform.googleapis.com/v1/projects/{project-id}/locations/{location}/endpoints/{endpoint-id}:predict` with a JSON body like `{"instances": [{}]}.
- SDK Snippet:
  ```python
  from google.cloud import aiplatform
  aiplatform.init(project='my-project', location='us-central1')
  model = aiplatform.Model.upload(display_name='my-model', artifact_uri='gs://bucket/path')
  ```
- Config Format: Use YAML for pipeline definitions, e.g.,:
  ```
  components:
    - name: trainer
      componentRef: TrainerComponent
      inputs:
        - {inputParam: value}
  ```

## Integration Notes
Integrate Vertex AI with other GCP services by using the same project and credentials. Set `$GOOGLE_APPLICATION_CREDENTIALS` to the JSON key for authentication. For example, link with BigQuery by referencing datasets in training jobs. When integrating with external tools, handle OAuth 2.0 tokens via the Google Auth Library. Ensure region consistency across services to prevent errors. For SDK integration, import `google.cloud.aiplatform` and use methods like `VertexAIClient` for batch predictions.

## Error Handling
Common errors include authentication failures (e.g., "401 Unauthorized")—check if `$GOOGLE_APPLICATION_CREDENTIALS` is set correctly. For quota exceeded errors, use `gcloud ai operations describe` to monitor job status and adjust quotas via the GCP console. Handle API errors by catching exceptions in code, e.g.:
```python
try:
    response = aiplatform.Model.list()
except google.api_core.exceptions.Forbidden as e:
    print("Access denied; verify permissions.")
```
Validate inputs before commands, such as ensuring the region exists, and use `--quiet` flag in CLI to suppress non-error output.

## Concrete Usage Examples
1. **Train and Deploy a Simple Model**: First, upload a trained model: `gcloud ai models upload --display-name=my-model --container-image-uri=gcr.io/my-image --project=my-project`. Then, deploy it: `gcloud ai endpoints create --display-name=endpoint-name --region=us-central1`. Make a prediction: Use the SDK with `endpoint.predict(instances=[{"feature1": value}])`.
2. **Run a Vertex AI Pipeline**: Define a pipeline in a Python script: 
   ```python
   from kfp.v2 import compiler
   compiler.Compiler().compile(pipeline_func, 'pipeline.json')
   job = aiplatform.PipelineJob(template_path='pipeline.json', display_name='my-pipeline')
   job.submit()
   ```
   Monitor the job with `gcloud ai pipelines run describe --region=us-central1 --run=job-id`.

## Graph Relationships
- Related Cluster: cloud-gcp
- Related Tags: gcp, vertexai, machine-learning
- Connections: Links to other skills in cloud-gcp for broader GCP integration, such as data storage with BigQuery or compute resources with Compute Engine.
