---
name: model-deployment
cluster: aimlops
description: "Deploys machine learning models to production using containers and orchestration tools."
tags: ["mlops","deployment","containers"]
dependencies: []
composes: []
similar_to: []
called_by: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "machine learning model deployment mlops containers kubernetes"
---

# model-deployment

## Purpose
This skill automates the deployment of machine learning models to production environments using containers (e.g., Docker) and orchestration tools (e.g., Kubernetes), ensuring scalable and reliable ML model serving.

## When to Use
- When you need to containerize and deploy a trained ML model for real-time inference in production.
- For updating existing deployments in response to model retraining or performance issues.
- In MLOps pipelines where models must be versioned, monitored, and rolled back easily.
- When integrating with cloud providers like AWS EKS or Google GKE for managed orchestration.

## Key Capabilities
- Builds Docker images from model artifacts and deploys them to Kubernetes clusters.
- Supports model versioning via tags and handles rolling updates for zero-downtime deployments.
- Integrates with ML frameworks like TensorFlow or PyTorch for serving models via APIs.
- Manages resource allocation, such as CPU/GPU requests in Kubernetes pods, e.g., `resources: limits: cpu: 2`.
- Automates scaling based on traffic, using Kubernetes Horizontal Pod Autoscalers.

## Usage Patterns
To use this skill, first prepare your model in a Docker-friendly format, then build and deploy it. Always set environment variables for authentication, like `$KUBECONFIG` for Kubernetes access.

Pattern 1: Basic deployment
- Export your model as a saved file (e.g., `model.h5`) and write a Dockerfile.
- Build the image locally or in CI/CD.
- Apply a Kubernetes deployment YAML to orchestrate the container.

Pattern 2: Update an existing deployment
- Tag a new model version and rebuild the Docker image.
- Use kubectl to apply changes, specifying the new image tag.
- Monitor the rollout and roll back if needed using built-in commands.

Always verify cluster access before starting; check with `kubectl get nodes` to ensure connectivity.

## Common Commands/API
Use these CLI commands for core operations. For API interactions, reference Kubernetes REST API endpoints.

- Build and tag a Docker image:  
  `docker build -t mymlmodel:v1 .`  
  This creates an image from the current directory.

- Push the image to a registry:  
  `docker push mymlmodel:v1`  
  Requires authentication via `$DOCKER_REGISTRY_TOKEN` as an env var.

- Deploy to Kubernetes:  
  `kubectl apply -f deployment.yaml`  
  Where deployment.yaml includes:  
  `apiVersion: apps/v1`  
  `kind: Deployment`  
  `metadata: name: myml-deployment`  
  `spec: replicas: 3, template: spec: containers: - name: model-server image: mymlmodel:v1`

- Scale the deployment:  
  `kubectl scale deployment myml-deployment --replicas=5`

- API endpoint for querying deployments:  
  Use the Kubernetes API at `GET /apis/apps/v1/namespaces/default/deployments` with authentication via bearer token in `$KUBE_API_TOKEN`.

For config formats, use Kubernetes YAML files, e.g.:  
```yaml
apiVersion: v1  
kind: Service  
metadata: name: model-service  
spec: selector: app: mymlmodel, ports: - protocol: TCP port: 80
```

## Integration Notes
Integrate this skill with CI/CD tools like GitHub Actions or Jenkins by adding steps in your pipeline YAML. For example, in GitHub Actions:  
```yaml
jobs:  
  deploy:  
    runs-on: ubuntu-latest  
    steps:  
      - uses: actions/checkout@v2  
      - run: docker build -t mymlmodel:${{ github.sha }} .  
      - run: kubectl apply -f k8s/deployment.yaml --context=$KUBE_CONTEXT
```
Set env vars for secrets, e.g., `$GITHUB_TOKEN` for repo access and `$KUBE_CONTEXT` for cluster selection. Ensure your ML pipeline outputs are in a standard format, like a pickled model file, for seamless Docker integration.

## Error Handling
Handle common errors proactively. If `docker build` fails with "no such file," verify the Dockerfile path and required files. For Kubernetes errors like "image pull failed," check image registry credentials via `$DOCKER_REGISTRY_TOKEN`.

- Error: Pod not ready – Fix by inspecting logs with `kubectl logs <pod-name>` and ensure resources match in deployment YAML, e.g., add `resources: requests: memory: "1Gi"`.
- Error: Authentication failure – Set env vars correctly, e.g., export `KUBECONFIG=~/.kube/config`, and test with `kubectl get pods`.
- For API errors, like 401 Unauthorized, retry with refreshed tokens from `$KUBE_API_TOKEN` and use exponential backoff in scripts.

Always include try-catch in automation scripts, e.g.:  
```python
import subprocess  
try:  
    subprocess.run(["kubectl", "apply", "-f", "deployment.yaml"], check=True)  
except subprocess.CalledProcessError as e:  
    print(f"Deployment failed: {e}")
```

## Graph Relationships
- Related Cluster: aimlops
- Related Tags: mlops, deployment, containers
- Connected Skills: model-training (for pre-deployment), monitoring (for post-deployment observability)
