---
name: aws-ec2
cluster: cloud-aws
description: "Manage and configure Amazon EC2 instances for scalable virtual servers and cloud computing resources."
tags: ["aws-ec2","virtual-machines","cloud-computing"]
dependencies: []
composes: []
similar_to: []
called_by: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "aws ec2 instances virtual servers cloud computing"
---

# aws-ec2

## Purpose
This skill enables precise management and configuration of Amazon EC2 instances, allowing for the creation, scaling, and termination of virtual servers in AWS. Use it to automate cloud computing tasks like deploying applications on scalable infrastructure.

## When to Use
Use this skill when you need to provision EC2 instances for dynamic workloads, such as web servers or batch processing. Apply it in scenarios requiring elastic scaling, like handling traffic spikes, migrating on-premises VMs to the cloud, or testing environments. Avoid it for static resources; opt for other AWS services if needed.

## Key Capabilities
- Launch EC2 instances with specific parameters: specify AMI ID, instance type (e.g., t2.micro), and security groups via the AWS CLI.
- Configure instance attributes: set user data scripts for boot-time customization, e.g., installing software on startup.
- Monitor and scale instances: use Auto Scaling groups to maintain desired capacity based on metrics like CPU utilization.
- Terminate or stop instances: handle cleanup with tags for resource tracking.
- Manage networking: assign public IPs, subnets, and VPC settings for secure access.
- Use spot instances for cost savings: bid on unused capacity with constraints like interruption notifications.
- Encrypt EBS volumes: enable encryption at launch using KMS keys for data security.
- Tag resources: apply key-value pairs (e.g., "Environment=Production") for organization and cost allocation.
- Describe instances: query metadata like state, type, and launch time for monitoring.
- Import/Export VMs: convert existing VMs to EC2 AMIs using specific tools like VM Import/Export.

## Usage Patterns
Always initialize AWS credentials via environment variables (e.g., export AWS_ACCESS_KEY_ID=$YOUR_KEY) before invoking commands. For scripts, wrap EC2 operations in try-catch blocks to handle failures. Pattern 1: Use in automation pipelines to launch instances on demand, e.g., check for existing instances first. Pattern 2: Integrate with CI/CD for ephemeral environments—launch, run tests, then terminate. For multi-step tasks, chain commands: first describe instances, then run if none exist. Avoid hardcoding credentials; use IAM roles for EC2 access. Example pattern in code: Use AWS SDK to check instance status before launching.

## Common Commands/API
Use the AWS CLI for direct execution; ensure AWS CLI is installed and configured. For API calls, target the EC2 endpoint (e.g., https://ec2.amazonaws.com) with HTTP requests.

- CLI Commands:
  - Launch an instance: `aws ec2 run-instances --image-id ami-0123456789abcdef0 --count 1 --instance-type t2.micro --key-name MyKeyPair --security-group-ids sg-0123456789abcdef0`
  - Describe running instances: `aws ec2 describe-instances --filters "Name=instance-state-name,Values=running" --query "Reservations[*].Instances[*].InstanceId"`
  - Stop an instance: `aws ec2 stop-instances --instance-ids i-0123456789abcdef0`
  - Terminate an instance: `aws ec2 terminate-instances --instance-ids i-0123456789abcdef0`
  - Create a security group: `aws ec2 create-security-group --group-name MySG --description "My security group" --vpc-id vpc-0123456789abcdef0`

- API Endpoints and Calls:
  - Endpoint: https://ec2.amazonaws.com, with actions like RunInstances (POST request with XML payload).
  - Example API call via SDK: In Python, use boto3: `ec2 = boto3.client('ec2'); response = ec2.run_instances(ImageId='ami-0123456789abcdef0', MinCount=1, MaxCount=1)`
  - Query endpoint: Use DescribeInstances action for metadata retrieval.
  - Config format: API requests require XML or JSON payloads, e.g., {"Action": "RunInstances", "Version": "2016-11-15"} in the request body.

## Integration Notes
Integrate this skill with other AWS services by setting up IAM roles for secure access—use environment variables like `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` for authentication. For example, set `export AWS_REGION=us-west-2` to specify the region. When combining with tools like Terraform, reference EC2 resources in HCL configs (e.g., resource "aws_instance" "example" { ami = "ami-0123456789abcdef0" }). For SDK integration, import libraries like boto3 in Python and handle sessions: `session = boto3.Session(region_name='us-west-2')`. Ensure VPC peering or transit gateways for network integration. Use AWS Config for compliance checks on EC2 resources.

## Error Handling
Handle common errors by checking response codes and logs. For permission issues (e.g., "UnauthorizedOperation"), verify IAM policies—ensure the role has `ec2:RunInstances` action. If an instance fails to launch (e.g., due to quota limits), use `aws ec2 describe-account-attributes --attribute supported-platforms` to check limits, then request increases via AWS support. For network errors, validate security groups and VPC settings. In code, wrap commands in try-except: try { $result = aws ec2 run-instances ... } catch { if ($_.Exception.Message -like "*AccessDenied*") { Write-Output "Check IAM roles" } }. Log errors with instance IDs for debugging, and use exponential backoff for rate limit errors (e.g., wait 5 seconds and retry).

## Usage Examples
- Example 1: Launch a simple EC2 instance for a web server. First, set credentials: export AWS_ACCESS_KEY_ID=$YOUR_KEY. Then, run: aws ec2 run-instances --image-id ami-0123456789abcdef0 --count 1 --instance-type t2.micro --key-name MyKeyPair. Wait for it to run: aws ec2 wait instance-running --instance-ids $(aws ec2 describe-instances --query "Reservations[0].Instances[0].InstanceId" --output text).
- Example 2: Stop and terminate an instance after use. Query instances: aws ec2 describe-instances --filters "Name=tag:Name,Values=MyInstance". Then stop: aws ec2 stop-instances --instance-ids i-0123456789abcdef0. Finally, terminate: aws ec2 terminate-instances --instance-ids i-0123456789abcdef0.

## Graph Relationships
- Related to: aws-s3 (for storing EC2 data volumes), aws-lambda (for triggering EC2 actions), aws-iam (for managing access keys).
- In cluster: cloud-aws, connects to aws-vpc (for networking) and aws-autoscaling (for instance scaling).
- Dependencies: Requires aws-ec2 as a base; can link to general cloud-computing skills for broader AWS ecosystem integration.
