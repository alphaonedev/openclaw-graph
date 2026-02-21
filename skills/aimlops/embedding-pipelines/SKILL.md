---
name: embedding-pipelines
cluster: aimlops
description: "Manages embedding pipelines for AI/ML models, including creation, optimization, and deployment."
tags: ["ai","ml","embeddings","pipelines"]
dependencies: []
composes: []
similar_to: []
called_by: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "ai ml embeddings pipelines"
---

# embedding-pipelines

## Purpose
This skill manages embedding pipelines for AI/ML models, enabling creation, optimization, and deployment of pipelines that handle vector embeddings for tasks like NLP or recommendation systems. It integrates with frameworks like Hugging Face or TensorFlow to streamline workflows.

## When to Use
Use this skill when you need to generate, fine-tune, or deploy embedding models, such as transforming text into vectors for similarity searches. Apply it in scenarios involving large datasets, model optimization for inference speed, or integrating embeddings into production ML pipelines.

## Key Capabilities
- Create embedding pipelines with custom models (e.g., BERT, Word2Vec) and data sources.
- Optimize pipelines for performance, including dimensionality reduction via PCA or quantization.
- Deploy pipelines to cloud environments like AWS Sagemaker or local servers.
- Monitor pipeline metrics such as embedding quality and latency.
- Support for batch and real-time processing with configurable input formats (e.g., JSON, CSV).

## Usage Patterns
Always initialize with authentication via environment variable `$EMBEDDING_API_KEY`. Use CLI for quick tasks or API for programmatic integration. Start by defining a pipeline configuration file (YAML or JSON), then execute commands to build and deploy. For loops or scripts, wrap API calls in error-checked functions. Example pattern: Load config, create pipeline, optimize, then deploy.

## Common Commands/API
Use the OpenClaw CLI with the `embedding-pipelines` subcommand. Authentication requires setting `$EMBEDDING_API_KEY` before running commands.

- **Create a pipeline**:  
  `openclaw embedding-pipelines create --config pipeline.yaml --model bert`  
  (Config file example: {"model": "bert", "data_path": "data.csv"})

- **Optimize a pipeline**:  
  `openclaw embedding-pipelines optimize --pipeline-id 123 --method pca --dimensions 128`  
  (API endpoint: POST /api/embedding-pipelines/123/optimize with body: {"method": "pca", "dimensions": 128})

- **Deploy a pipeline**:  
  `openclaw embedding-pipelines deploy --pipeline-id 123 --endpoint http://my-server:8080`  
  (Code snippet:  
  import requests  
  response = requests.post('http://api.openclaw.com/api/embedding-pipelines/deploy', json={"id": 123, "endpoint": "http://my-server:8080"}, headers={"Authorization": f"Bearer {os.environ['EMBEDDING_API_KEY']}"}  
  )

- **List pipelines**:  
  `openclaw embedding-pipelines list --filter active`  
  (API: GET /api/embedding-pipelines?filter=active)

Config format is JSON or YAML, e.g.:  
{  
  "model": "bert",  
  "input_type": "text",  
  "output_dim": 768  
}

## Integration Notes
Integrate by setting `$EMBEDDING_API_KEY` in your environment. For Python scripts, use the OpenClaw SDK: install via `pip install openclaw-sdk`, then import and authenticate. Example: `from openclaw import EmbeddingPipelines; client = EmbeddingPipelines(api_key=os.environ['EMBEDDING_API_KEY'])`. Ensure your application handles asynchronous responses for long-running tasks. For Kubernetes, mount config files as secrets and reference them in deployment YAML.

## Error Handling
Check CLI exit codes (e.g., non-zero for failures) and API response status codes (e.g., 400 for bad requests, 401 for auth errors). Handle specific errors like invalid config by parsing response JSON (e.g., {"error": "Invalid model type"}). In code, use try-except blocks:  
try:  
  response = client.create_pipeline(config)  
except Exception as e:  
  if "Invalid config" in str(e):  
    print("Fix config and retry")  

Log errors with details like pipeline ID for debugging. Retry transient errors (e.g., network issues) with exponential backoff.

## Usage Examples
1. **Create and optimize a simple embedding pipeline for text data**:  
   First, create a config file `pipeline.yaml` with: {"model": "bert", "data_path": "text_data.csv"}. Then run:  
   `export EMBEDDING_API_KEY=your_key_here`  
   `openclaw embedding-pipelines create --config pipeline.yaml`  
   Follow with: `openclaw embedding-pipelines optimize --pipeline-id 456 --method quantization`

2. **Deploy an optimized pipeline to a cloud endpoint**:  
   After optimization, deploy with:  
   `openclaw embedding-pipelines deploy --pipeline-id 456 --endpoint https://sagemaker-endpoint.aws.com`  
   In a script:  
   client = EmbeddingPipelines(api_key=os.environ['EMBEDDING_API_KEY'])  
   client.deploy(456, "https://sagemaker-endpoint.aws.com")  

## Graph Relationships
- Relates to: "model-training" (for feeding optimized embeddings into training loops)
- Depends on: "data-preprocessing" (for handling input data cleaning)
- Integrates with: "inference-serving" (for deploying pipelines to production servers)
- Conflicts with: None directly, but avoid concurrent use with "vector-search" if pipelines overlap
