---
name: aws-iam
cluster: cloud-aws
description: "Manage AWS Identity and Access Management for controlling user access and permissions to secure cloud resources."
tags: ["aws","iam","security"]
dependencies: []
composes: []
similar_to: []
called_by: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "aws iam identity access management policies users roles permissions audit"
---

## aws-iam

### Purpose
This skill enables management of AWS Identity and Access Management (IAM) to control user access, permissions, and security for AWS resources. It handles creation, modification, and auditing of users, groups, roles, and policies to enforce least-privilege access.

### When to Use
Use this skill when securing AWS environments by managing access controls, such as granting permissions to new users, auditing existing policies, or rotating credentials. Apply it in scenarios involving multi-user environments, compliance requirements (e.g., PCI-DSS), or dynamic resource provisioning in CI/CD pipelines.

### Key Capabilities
- Create and manage IAM users, groups, roles, and policies using AWS APIs.
- Attach or detach policies to users/roles for fine-grained permissions.
- Generate and rotate access keys, and audit IAM configurations.
- Support for policy simulation to test permissions without applying changes.
- Integration with AWS STS for temporary credentials.

### Usage Patterns
To use this skill, invoke it via AWS CLI or SDKs in your code. Always set environment variables for authentication first, e.g., export AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY and export AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY. For Python (Boto3), import the library and create a session. Use try-except blocks for error handling in scripts.

Example pattern for creating a user:
```python
import boto3
iam = boto3.client('iam')
response = iam.create_user(UserName='new-user')
print(response)
```

For policy attachment, use CLI commands in scripts or automation tools like Ansible.

### Common Commands/API
Use AWS CLI for direct execution or integrate via SDKs. Key commands include:
- Create a user: `aws iam create-user --user-name example-user`
- Create a policy: `aws iam create-policy --policy-name MyPolicy --policy-document file://policy.json`
- Attach policy to user: `aws iam attach-user-policy --user-name example-user --policy-arn arn:aws:iam::123456789012:policy/MyPolicy`
- List users: `aws iam list-users --query 'Users[*].UserName'`
API endpoints: Use HTTPS POST to `https://iam.amazonaws.com` with actions like `CreateUser` or `AttachUserPolicy`. Policy documents must be in JSON format, e.g., {"Version": "2012-10-17", "Statement": [{"Effect": "Allow", "Action": "s3:*", "Resource": "*"}]}.

### Integration Notes
Integrate with other AWS services by using shared credentials files (e.g., ~/.aws/credentials) or environment variables like $AWS_REGION for region-specific operations. For SDK integration, initialize clients with: `boto3.client('iam', region_name='us-east-1')`. Ensure IAM roles are assumed via STS for cross-account access, e.g., `aws sts assume-role --role-arn arn:aws:iam::123456789012:role/MyRole --role-session-name session1`. Avoid hardcoding keys; use IAM instance profiles in EC2 for secure access.

### Error Handling
Common errors include AccessDeniedException (check permissions), NoSuchEntityException (verify resource exists), and LimitExceededException (e.g., too many users). Handle via try-except in code, e.g.:
```python
try:
    iam.create_user(UserName='test-user')
except iam.exceptions.LimitExceededException as e:
    print("Error: User limit reached. Increase quota via AWS console.")
except Exception as e:
    print(f"Unexpected error: {e}")
```
For CLI, check exit codes and use `--debug` flag for details. Always validate inputs, like ensuring policy ARNs are correctly formatted before attachment.

### Concrete Usage Examples
1. **Create an IAM user and attach a policy**: First, export credentials: export AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY and export AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY. Then, run: `aws iam create-user --user-name dev-user` followed by `aws iam create-policy --policy-name DevPolicy --policy-document '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Action":["ec2:Describe*"],"Resource":"*"}]}'` and `aws iam attach-user-policy --user-name dev-user --policy-arn arn:aws:iam::123456789012:policy/DevPolicy`. This grants the user read-only EC2 access.

2. **Audit and rotate access keys**: Use `aws iam list-access-keys --user-name existing-user` to list keys, then delete old ones with `aws iam delete-access-key --user-name existing-user --access-key-id AKIAEXAMPLE`. For rotation, create a new key via `aws iam create-access-key --user-name existing-user`, then update applications to use the new key. This ensures compliance with key rotation policies.

### Graph Relationships
- Related to cluster: cloud-aws
- Connected via tags: aws, iam, security
- Links to other skills: depends on aws-core for general AWS operations; integrates with aws-s3 for policy enforcement on resources.
