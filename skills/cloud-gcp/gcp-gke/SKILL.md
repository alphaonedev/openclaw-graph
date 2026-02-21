---
name: gcp-gke
cluster: cloud-gcp
description: "Manage and deploy containerized applications on Google Kubernetes Engine for scalable cloud-native orchestration."
tags: ["gcp","kubernetes","gke"]
dependencies: []
composes: []
similar_to: []
called_by: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "gcp gke kubernetes container orchestration google cloud"
---

# gcp-gke

## Purpose
This skill enables management and deployment of containerized applications on Google Kubernetes Engine (GKE), focusing on scalable orchestration using GCP's Kubernetes service.

## When to Use
Use this skill when deploying apps that require auto-scaling, load balancing, or managed Kubernetes clusters on GCP. Apply it for microservices architectures, CI/CD pipelines, or when migrating apps to the cloud. Choose it over raw Kubernetes if you need GCP-specific integrations like IAM roles or Anthos. Avoid if you're working outside GCP or prefer on-prem solutions. Use for high-availability setups, such as e-commerce backends handling traffic spikes. Deploy when apps need persistent storage via GCP's Filestore. Select for scenarios involving GPU acceleration for ML workloads. Use if you're integrating with other GCP services like Cloud SQL. Apply when auditing and logging are needed via GCP's native tools. Use for cost-optimized clusters with preemptible VMs.

## Key Capabilities
- Create and manage GKE clusters using `gcloud` CLI with flags like `--cluster-version` for specifying Kubernetes versions (e.g., 1.24).
- Deploy applications via YAML manifests, supporting features like node autoscaling with HPA (Horizontal Pod Autoscaler).
- Handle networking with VPC-native clusters, using subnet configurations for pod IP addressing.
- Integrate with GCP Identity for RBAC, assigning roles via `gcloud projects add-iam-policy-binding`.
- Scale workloads dynamically using GKE's regional clusters for multi-zone redundancy.
- Monitor clusters with integrated Stackdriver (now Operations), pulling metrics via API endpoints like `https://monitoring.googleapis.com/v3/projects/[PROJECT_ID]/metricDescriptors`.
- Use node pools for heterogeneous workloads, defining machine types in cluster configs (e.g., `n1-standard-1` for cost efficiency).
- Enable features like private clusters for enhanced security, configuring via `--enable-private-nodes`.
- Automate deployments with GKE's support for Helm charts or kubectl apply commands.
- Manage costs with committed use discounts, tracked via GCP Billing API.

## Usage Patterns
To create a GKE cluster, first set the GCP project with `gcloud config set project [PROJECT_ID]`, then use `gcloud container clusters create [CLUSTER_NAME] --zone [ZONE] --machine-type n1-standard-1`. For deploying apps, write a Kubernetes deployment YAML and apply it with `kubectl apply -f deployment.yaml --context [CLUSTER_CONTEXT]`. Pattern for scaling: Use HPA by defining in YAML like `kind: HorizontalPodAutoscaler` with `minReplicas: 1` and `maxReplicas: 10`, then apply and monitor. For CI/CD, integrate with Cloud Build by triggering builds on code changes, using commands like `gcloud builds submit --tag gcr.io/[PROJECT_ID]/image`. Authenticate kubectl with `gcloud container clusters get-credentials [CLUSTER_NAME]`. For updates, use rolling updates in deployments by setting `strategy: RollingUpdate` in YAML. Delete clusters safely with `gcloud container clusters delete [CLUSTER_NAME] --quiet` after draining nodes.

## Common Commands/API
Use `gcloud container clusters create [NAME] --zone us-central1-a --num-nodes 3 --machine-type e2-medium` to create a cluster; include `--enable-autoupgrade` for automatic updates. For deployment, run `kubectl run nginx --image=nginx --port=80` followed by `kubectl expose deployment nginx --port=80 --type=LoadBalancer`. API endpoint for clusters: POST to `https://container.googleapis.com/v1/projects/[PROJECT_ID]/locations/[ZONE]/clusters` with JSON body like {"name": "my-cluster", "initialNodeCount": 3}. Get cluster details with `gcloud container clusters describe [NAME]` or GET `https://container.googleapis.com/v1/projects/[PROJECT_ID]/locations/[ZONE]/clusters/[NAME]`. Scale nodes via `gcloud container clusters resize [NAME] --num-nodes 5`. For pods, use `kubectl get pods -o wide` and delete with `kubectl delete pod [POD_NAME]`. Authenticate API calls with `$GCP_SERVICE_KEY` environment variable, e.g., export it as `export GCP_SERVICE_KEY='your-key'`. Config format for clusters: YAML like apiVersion: container.cnrm.cloud.google.com/v1beta1, kind: ContainerCluster, spec: location: us-central1. Use `gcloud auth application-default login` for OAuth tokens.

## Integration Notes
Integrate GKE with other GCP services by enabling APIs via `gcloud services enable container.googleapis.com`. For IAM, set environment variables like `export GOOGLE_APPLICATION_CREDENTIALS='/path/to/key.json'` for service accounts. Link with Cloud Storage for persistent volumes using CSI drivers in pod specs, e.g., volume: gcsBucket: gs://my-bucket. Connect to BigQuery for logging by routing GKE logs to Pub/Sub. For CI/CD, use GitHub Actions with steps like `gcloud auth configure-docker` and `docker push gcr.io/[PROJECT_ID]/image`. Integrate with Terraform by defining resources like resource "google_container_cluster" { name = "my-cluster", location = "us-central1" }. Use Kubernetes operators for custom resources, ensuring compatibility with GKE versions. For networking, configure VPC peering with `gcloud compute networks peerings create`. Always validate integrations with `gcloud container clusters get-credentials` to update kubeconfig.

## Error Handling
If `gcloud container clusters create` fails with "Insufficient permissions", check IAM roles and set `$GOOGLE_CREDENTIALS` env var. For "Quota exceeded", use `gcloud compute project-info add-metadata --metadata quota-increase-requested=true` and monitor via console. Handle kubectl errors like "The connection to the server was refused" by running `gcloud container clusters get-credentials [NAME]` to refresh context. If pods fail with "ImagePullBackOff", verify image paths in deployment YAML and ensure GCR access. For API errors (e.g., 403 Forbidden), retry with exponential backoff and include auth headers like Authorization: Bearer $(gcloud auth print-access-token). Parse error responses from endpoints like `https://container.googleapis.com/v1/projects/[PROJECT_ID]/zones/[ZONE]/clusters` for details. Use `gcloud auth login --update-adc` to fix authentication issues. Log errors with GCP's Error Reporting by enabling it in the project.

## Concrete Usage Examples
Example 1: Create a GKE cluster and deploy a simple app.  
First, run: `gcloud config set project my-project` and `export GOOGLE_APPLICATION_CREDENTIALS='/path/to/key.json'`.  
Then: `gcloud container clusters create my-gke-cluster --zone us-central1-a --num-nodes 1`.  
Deploy: `kubectl create deployment hello-server --image=gcr.io/google-samples/hello-app:1.0`.  

Example 2: Scale and monitor a GKE deployment.  
Apply HPA: `kubectl autoscale deployment hello-server --cpu-percent=50 --min=1 --max=10`.  
Monitor: `kubectl get hpa`.  
Check metrics via API: `curl -H "Authorization: Bearer $(gcloud auth print-access-token)" https://monitoring.googleapis.com/v3/projects/my-project/timeSeries`.

## Graph Relationships
- Related to cluster: cloud-gcp (parent cluster for GCP-related skills).
- Links to skills: gcp (for general GCP management), kubernetes (for core Kubernetes operations).
- Depends on: gcp-auth (for authentication mechanisms).
- Connected via tags: gke, kubernetes (shared with other container skills).
