---
name: aws-ecs
cluster: cloud-aws
description: "Orchestrate and manage Docker containers on AWS using Amazon Elastic Container Service for scalable applications."
tags: ["aws","ecs","container"]
dependencies: []
composes: []
similar_to: []
called_by: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "aws ecs container orchestration docker aws-cloud"
---

# aws-ecs

## Purpose
This skill orchestrates and manages Docker containers on AWS using Amazon Elastic Container Service (ECS) for deploying scalable applications. It handles task definitions, services, and clusters to automate container lifecycle management.

## When to Use
Use this skill for applications requiring high availability and scalability, such as microservices architectures, web apps with variable traffic, or batch jobs. Choose ECS when you need AWS-managed orchestration without the overhead of self-managing Kubernetes, especially if you're already in the AWS ecosystem.

## Key Capabilities
- Run containers on EC2 instances or serverless Fargate for flexible compute options.
- Define task definitions in JSON format, e.g., specifying CPU/memory limits and container images from ECR.
- Enable auto-scaling with ECS service integrations, using CloudWatch metrics to scale based on CPU utilization.
- Integrate with Application Load Balancers (ALB) for traffic routing and health checks.
- Support for secrets and environment variables via AWS Secrets Manager or Parameter Store.

## Usage Patterns
To deploy a container, first create an ECS cluster, then define a task with a Docker image, and run it as a service for persistent management. For one-off tasks, use run-task commands. Always specify the cluster ARN and region in commands. Use Fargate for serverless deployments to avoid managing EC2 instances. For production, combine with IAM roles for secure access and CloudWatch for logging/monitoring.

## Common Commands/API
Use AWS CLI for interactions; ensure AWS credentials are set via environment variables like `$AWS_ACCESS_KEY_ID` and `$AWS_SECRET_ACCESS_KEY`. API endpoints are under `https://ecs.amazonaws.com/`.

- Create a cluster:  
  ```bash
  aws ecs create-cluster --cluster-name my-cluster
  ```
- Run a task:  
  ```bash
  aws ecs run-task --cluster my-cluster --task-definition my-task:1 --launch-type FARGATE --network-configuration "awsvpcConfiguration={...}"
  ```
- Update a service:  
  ```bash
  aws ecs update-service --cluster my-cluster --service my-service --desired-count 5
  ```
- API example: POST to `/` endpoint with action parameter, e.g., curl request:  
  ```bash
  curl -X POST https://ecs.amazonaws.com/ -d 'Action=ListClusters&Version=2014-11-13'
  ```
- Task definition JSON format:  
  ```json
  { "family": "my-task", "containerDefinitions": [{ "name": "app", "image": "123456789012.dkr.ecr.us-west-2.amazonaws.com/my-image:latest" }] }
  ```

## Integration Notes
Integrate ECS with other AWS services by attaching IAM policies; for example, add an IAM role to your task definition for S3 access. Use environment variables in task definitions, e.g., set `$MY_VAR` via Parameter Store. For CI/CD, link with CodePipeline: define a pipeline stage that runs `aws ecs update-service`. Ensure VPC settings match for networking; specify subnets and security groups in network configurations. For authentication, always use AWS SDKs with credential providers or set env vars like `$AWS_REGION=us-west-2`.

## Error Handling
Check for common errors like "Resource not found" by verifying cluster/task ARNs before commands. Handle permission issues with `aws sts get-caller-identity` to confirm IAM roles. For failed tasks, use `aws ecs describe-tasks` to get events, e.g.:  
```bash
aws ecs describe-tasks --cluster my-cluster --tasks task-arn
```
Parse the "stoppedReason" field; if it's "Essential container in task exited", debug the container logs via CloudWatch. Use try-catch in scripts for API calls, e.g., in Python:  
```python
import boto3
try: client.run_task(...) except client.exceptions.ClientException as e: print(e)
```
Retry transient errors (e.g., throttling) with exponential backoff.

## Concrete Usage Examples
1. Deploy a simple web app: First, create a cluster and task definition for a Nginx container. Then, run it as a service:  
   ```bash
   aws ecs create-cluster --cluster-name web-cluster
   aws ecs register-task-definition --family web-app --container-definitions file://task-def.json
   aws ecs create-service --cluster web-cluster --service-name web-service --task-definition web-app:1 --desired-count 2 --launch-type FARGATE
   ```
   Monitor with `aws ecs describe-services --cluster web-cluster --services web-service`.

2. Scale a batch processing service: Define a task for image processing, then update the service to scale based on a CloudWatch alarm. Use:  
   ```bash
   aws ecs update-service --cluster batch-cluster --service batch-service --desired-count 10
   aws application-autoscaling put-scaling-policy --policy-name scale-out --service-namespace ecs --resource-id service/batch-cluster/batch-service --scalable-dimension ecs:service:DesiredCount --policy-type TargetTrackingScaling
   ```
   This ensures automatic scaling when queue depth exceeds a threshold.

## Graph Relationships
- Related to: aws-ec2 (for EC2 launch type), aws-lambda (for event-driven integrations), aws-ecr (for container image storage), docker (for base container management).
- Depends on: cloud-aws (cluster parent).
- Integrates with: aws-iam (for access control), aws-cloudwatch (for monitoring).
