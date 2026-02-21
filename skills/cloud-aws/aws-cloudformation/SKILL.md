---
name: aws-cloudformation
cluster: cloud-aws
description: "AWS CloudFormation is a service for modeling and provisioning AWS resources using YAML or JSON templates."
tags: ["aws","cloudformation","iac"]
dependencies: []
composes: []
similar_to: []
called_by: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "aws cloudformation infrastructure as code templates provisioning stacks"
---

# aws-cloudformation

## Purpose
This skill enables the AI to interact with AWS CloudFormation for provisioning and managing AWS resources using YAML or JSON templates, allowing for Infrastructure as Code (IaC) practices.

## When to Use
Use this skill when you need to automate deployment of AWS resources, such as EC2 instances or S3 buckets, via templates; ideal for repeatable, version-controlled infrastructure setups, or when managing multiple environments (e.g., dev, prod) to ensure consistency.

## Key Capabilities
- Create and manage stacks of AWS resources from templates.
- Support for YAML and JSON template formats for defining resources, parameters, and outputs.
- Handle stack updates, deletions, and rollbacks with change sets.
- Integrate with other AWS services for conditional resource creation (e.g., using Fn::If in templates).
- Validate templates before deployment to catch syntax errors.

## Usage Patterns
To use this skill, first ensure AWS credentials are set via environment variables (e.g., `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`). Then, load a template file and execute commands to create or update stacks. Always validate templates locally before deployment. For automation, embed this in scripts by calling AWS CLI or SDK methods sequentially. Example pattern: Read template from file, validate it, create a stack, and monitor its status.

## Common Commands/API
Use the AWS CLI for direct interactions. Key commands:
- Create a stack: `aws cloudformation create-stack --stack-name my-stack --template-body file://template.yaml --parameters ParameterKey=KeyName,ParameterValue=MyKey`
- Update a stack: `aws cloudformation update-stack --stack-name my-stack --template-body file://updated-template.yaml --parameters file://params.json`
- Delete a stack: `aws cloudformation delete-stack --stack-name my-stack`
- Validate a template: `aws cloudformation validate-template --template-body file://template.yaml`
API endpoints (via AWS SDK):
- Create stack: POST to `https://cloudformation.us-east-1.amazonaws.com/` with body containing `StackName` and `TemplateBody`.
- Example SDK snippet in Python (using boto3):
  ```
  import boto3
  cf = boto3.client('cloudformation')
  response = cf.create_stack(StackName='my-stack', TemplateBody='{"AWSTemplateFormatVersion": "2010-09-09"}')
  ```
Config formats: Templates must be in YAML or JSON; parameters can be passed as JSON files (e.g., `{"ParameterKey": "Env", "ParameterValue": "prod"}`).

## Integration Notes
Integrate by setting AWS credentials as environment variables (e.g., `export AWS_ACCESS_KEY_ID=your_key; export AWS_SECRET_ACCESS_KEY=your_secret`). In code, use AWS SDKs like boto3 for Python or the AWS SDK for JavaScript. For CI/CD, combine with tools like GitHub Actions: add a step to run `aws cloudformation deploy` after building templates. Ensure region is specified (e.g., via `--region us-east-1` flag or `AWS_REGION` env var). To chain with other skills, output stack IDs for use in subsequent AWS operations, like passing an EC2 instance ID to an "aws-ec2" skill.

## Error Handling
Handle common errors prescriptively:
- Template validation failures: Use `aws cloudformation validate-template` first; if it fails with "Template validation error", check for syntax issues in YAML/JSON (e.g., missing commas).
- Stack creation errors: If `aws cloudformation create-stack` returns "Insufficient permissions", verify IAM roles via `aws iam get-role --role-name YourRole` and add necessary policies.
- Rollback on failure: Set `--on-failure DELETE` in create-stack to auto-cleanup; monitor with `aws cloudformation describe-stack-events --stack-name my-stack` and parse events for errors like "RESOURCE_CREATION_FAILED".
- General pattern: Wrap commands in try-catch blocks in scripts; e.g., in Python:
  ```
  try:
      cf.create_stack(...)
  except cf.exceptions.ValidationError as e:
      print(f"Error: {e}")
  ```

## Concrete Usage Examples
Example 1: Create a simple S3 bucket stack.
- Steps: Prepare a YAML template file (e.g., `template.yaml`) with content like:
  ```
  Resources:
    MyBucket:
      Type: AWS::S3::Bucket
  ```
- Execute: `aws cloudformation create-stack --stack-name s3-stack --template-body file://template.yaml`
- This provisions an S3 bucket; monitor with `aws cloudformation wait stack-create-complete --stack-name s3-stack`.

Example 2: Update an existing EC2 stack with new parameters.
- Steps: Update your template to include an EC2 instance (e.g., add `Type: AWS::EC2::Instance` in `updated-template.yaml`).
- Execute: `aws cloudformation update-stack --stack-name ec2-stack --template-body file://updated-template.yaml --parameters file://new-params.json`
- This updates the stack; use `aws cloudformation describe-stacks --stack-name ec2-stack` to verify changes.

## Graph Relationships
- Related to cluster: "cloud-aws" (e.g., connects to skills like "aws-ec2", "aws-s3" for resource management).
- Related to tags: "aws" (links to other AWS services), "cloudformation" (specific to IaC), "iac" (connects to tools like "terraform" for alternative provisioning).
- Outgoing edges: Depends on "aws-iam" for authentication; integrates with "aws-lambda" for automated stack operations.
