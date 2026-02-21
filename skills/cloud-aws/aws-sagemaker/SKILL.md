---
name: aws-sagemaker
cluster: cloud-aws
description: "AWS SageMaker is a fully managed platform for building, training, and deploying machine learning models with integrated "
tags: ["aws","sagemaker","machine-learning"]
dependencies: []
composes: []
similar_to: []
called_by: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "aws sagemaker machine learning ml training deployment cloud"
---

# aws-sagemaker

## Purpose
This skill enables interaction with AWS SageMaker, a managed service for building, training, and deploying ML models, handling infrastructure like compute resources and data processing.

## When to Use
Use this skill for ML workflows on AWS, such as training models with large datasets, deploying endpoints for inference, or automating hyperparameter tuning. Apply it when you need scalable, integrated ML tools without managing underlying servers, especially in production environments with AWS resources.

## Key Capabilities
- Built-in algorithms: Access pre-built models like XGBoost via SageMaker APIs (e.g., `sagemaker.algorithm.estimator` in SDK).
- Notebook instances: Launch Jupyter notebooks with one-click, specifying instance type (e.g., ml.t3.medium) and lifecycle configurations.
- Hyperparameter optimization: Use automatic tuning with API calls to define ranges (e.g., {"learning_rate": [0.01, 0.1]}).
- Model deployment: Deploy trained models to real-time endpoints with autoscaling, specifying endpoint configuration like instance count.
- Data processing: Integrate with SageMaker Processing jobs for ETL, using built-in containers or custom scripts.

## Usage Patterns
Follow these patterns for common tasks: First, ensure AWS credentials are set via environment variables (e.g., `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`). For training, create an estimator object, fit it to data in S3, and deploy. Example 1: Train a model using Boto3:
```python
import boto3
sagemaker = boto3.client('sagemaker')
sagemaker.create_training_job(
    TrainingJobName='my-job',
    AlgorithmSpecification={'TrainingImage': '123456789012.dkr.ecr.us-west-2.amazonaws.com/sagemaker-tensorflow:2.3'},
    RoleArn='arn:aws:iam::123456789012:role/SageMakerRole'
)
```
Example 2: Deploy a model endpoint:
```python
sagemaker.create_endpoint(
    EndpointName='my-endpoint',
    EndpointConfigName='my-config',
    Tags=[{'Key': 'Environment', 'Value': 'Production'}]
)
```
For batch inference, submit jobs with input/output S3 URIs; for experimentation, use SageMaker Studio with specific VPC settings.

## Common Commands/API
Use AWS CLI for quick operations; for scripts, use Boto3 SDK. Set up with `aws configure` or env vars. Common CLI commands:
- Create a notebook instance: `aws sagemaker create-notebook-instance --notebook-instance-name my-notebook --instance-type ml.t3.medium --role-arn arn:aws:iam::123456789012:role/SageMakerRole`
- Start a training job: `aws sagemaker create-training-job --training-job-name my-job --algorithm-specification TrainingInputMode=File,TrainingImage=123456789012.dkr.ecr.us-west-2.amazonaws.com/sagemaker-scikit-learn:0.23-1 --role-arn arn:aws:iam::123456789012:role/SageMakerRole --hyperparameters file://hyperparams.json`
- Deploy an endpoint: `aws sagemaker create-endpoint --endpoint-name my-endpoint --endpoint-config-name my-config`
API endpoints: Interact via HTTPS, e.g., POST to `https://runtime.sagemaker.us-west-2.amazonaws.com/endpoints/my-endpoint/invocations` for predictions. Config formats: Hyperparameters in JSON (e.g., {"epochs": "10", "batch-size": "32"}); use S3 URIs for input data like `s3://my-bucket/training-data/`.

## Integration Notes
Integrate SageMaker with other AWS services by referencing ARNs and S3 buckets. For data access, link to S3 (e.g., specify `s3://my-bucket/data` in training jobs). Use IAM roles for cross-service permissions (e.g., attach policy for S3 access). For monitoring, enable CloudWatch logs in job configurations. When combining with Lambda, invoke SageMaker endpoints via API calls; ensure VPC peering if using private subnets. Set environment variables for credentials (e.g., `AWS_REGION=us-west-2`). For custom containers, push to ECR and reference the URI in job specs.

## Error Handling
Check for common errors like authentication failures (e.g., "Invalid access key" – verify $AWS_ACCESS_KEY_ID); use try-except in Boto3:
```python
try:
    response = sagemaker.create_training_job(**params)
except sagemaker.exceptions.SageMakerException as e:
    print(f"Error: {e.response['Error']['Code']} - {e.response['Error']['Message']}")
```
Handle resource limits (e.g., quota exceeded for instances) by checking AWS console quotas or using `aws sagemaker describe-notebook-instance` to debug status. For failed jobs, inspect CloudWatch logs via `aws logs get-log-events`; retry with adjusted parameters, like increasing instance type if OOM errors occur.

## Graph Relationships
- Related to cluster: cloud-aws
- Related to tags: aws, sagemaker, machine-learning
- Connections: Integrates with aws-ec2 (for compute), aws-s3 (for storage), and aws-lambda (for triggers)
