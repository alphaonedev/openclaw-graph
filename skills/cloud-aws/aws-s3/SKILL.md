---
name: aws-s3
cluster: cloud-aws
description: "Interact with AWS S3 for object storage, managing buckets, objects, and access controls."
tags: ["aws","s3","storage","cloud"]
dependencies: []
composes: []
similar_to: []
called_by: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "aws s3 storage bucket object cloud"
---

# aws-s3

## Purpose
This skill enables interaction with AWS S3 for managing object storage, including creating buckets, uploading/downloading objects, and configuring access controls. It's designed for reliable, scalable storage in cloud applications.

## When to Use
Use this skill for scenarios requiring durable object storage, such as hosting static websites, backing up databases, sharing files across applications, or integrating with data pipelines. Apply it when you need to handle large volumes of unstructured data or ensure high availability across regions.

## Key Capabilities
- Create and delete S3 buckets using standard AWS operations.
- Upload, download, and delete objects with versioning and lifecycle policies.
- Manage access controls via bucket policies, ACLs, and IAM roles.
- Handle multipart uploads for large files and enable encryption at rest or in transit.
- Query objects using S3 Select for filtering data without full downloads.

## Usage Patterns
To use this skill, first ensure AWS credentials are set via environment variables (e.g., `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`). Invoke commands in a script or application context. For CLI usage, prefix with `aws s3`; for API, use the AWS SDK in languages like Python. Always specify regions (e.g., `--region us-west-2`) to avoid default behavior. Pattern: Authenticate, then perform CRUD operations on buckets and objects.

## Common Commands/API
Use the AWS CLI for quick interactions or the S3 API for programmatic access. Set credentials with `export AWS_ACCESS_KEY_ID=your_key` and `export AWS_SECRET_ACCESS_KEY=your_secret`.

- **Create a bucket**: Run `aws s3 mb s3://my-bucket --region us-east-1`. This creates a new bucket in the specified region.
- **Upload an object**: Use `aws s3 cp localfile.txt s3://my-bucket/path/to/file.txt --acl public-read`. The `--acl public-read` flag grants public access.
- **List objects**: Execute `aws s3 ls s3://my-bucket/ --recursive` to list all objects recursively.
- **API Endpoint for GET Object**: Send a GET request to `https://s3.amazonaws.com/my-bucket/object-key`. In Python SDK:  
  ```python
  import boto3
  s3 = boto3.client('s3')
  response = s3.get_object(Bucket='my-bucket', Key='object-key')
  ```
- **Delete an object**: Command: `aws s3 rm s3://my-bucket/object-key --region us-east-1`. For versioned buckets, add `--version-id <version>` flag.
- **Set bucket policy**: Use `aws s3api put-bucket-policy --bucket my-bucket --policy file://policy.json`, where policy.json contains:  
  ```json
  {"Version": "2012-10-17", "Statement": [{"Effect": "Allow", "Principal": "*", "Action": "s3:GetObject", "Resource": "arn:aws:s3:::my-bucket/*"}]}
  ```

## Integration Notes
Integrate by configuring AWS credentials in your environment (e.g., via `.aws/credentials` file or env vars like `$AWS_REGION`). For SDK integration, install the AWS SDK for your language (e.g., `pip install boto3` for Python). When combining with other AWS services, use the same credentials; for example, link S3 to Lambda by granting permissions in IAM. Ensure compliance with AWS limits, like 100 buckets per account, and handle regional differences by specifying `--region` in commands. For CI/CD, use AWS CLI in scripts: `aws s3 sync local-dir s3://my-bucket/`.

## Error Handling
Common errors include authentication failures (e.g., "The AWS Access Key Id you provided does not exist"), resolved by verifying `$AWS_ACCESS_KEY_ID`. For bucket not found, check with `aws s3 ls s3://bucket-name` first. Handle permission issues by reviewing IAM policies; use `aws sts get-caller-identity` to confirm access. In code, catch exceptions like `botocore.exceptions.ClientError` and log details:  
```python
try:
    s3.delete_object(Bucket='my-bucket', Key='object-key')
except ClientError as e:
    print(e.response['Error']['Code'])  # e.g., 'NoSuchKey'
```  
Retry transient errors (e.g., throttling) with exponential backoff.

## Graph Relationships
- Connected to cluster: cloud-aws
- Related tags: aws, s3, storage, cloud, bucket, object
- Links to: Other skills in cloud-aws cluster, such as aws-ec2 for compute integration or aws-lambda for event-driven workflows.
