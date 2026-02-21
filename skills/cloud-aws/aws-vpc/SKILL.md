---
name: aws-vpc
cluster: cloud-aws
description: "Manage and configure Amazon Virtual Private Cloud for creating isolated, customizable network environments in AWS."
tags: ["aws-vpc","networking","cloud"]
dependencies: []
composes: []
similar_to: []
called_by: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "aws vpc virtual private cloud networking subnets security groups route tables"
---

# aws-vpc

## Purpose
This skill enables the AI agent to manage and configure Amazon VPC resources, allowing creation of isolated, customizable network environments in AWS for secure application deployment.

## When to Use
Use this skill when you need to set up private networks for EC2 instances, isolate resources from the public internet, or configure networking components like subnets and security groups. Apply it in scenarios involving multi-tier architectures, hybrid cloud setups, or compliance requirements for data isolation.

## Key Capabilities
- Create and delete VPCs with specific CIDR blocks.
- Manage subnets, including creation, association with VPCs, and availability zone assignments.
- Configure security groups to control inbound/outbound traffic using rules based on IP, ports, and protocols.
- Set up route tables to define traffic routing between subnets, internet gateways, or VPN connections.
- Handle VPC peering for connecting multiple VPCs across accounts or regions.

## Usage Patterns
Invoke this skill in OpenClaw by prefixing commands with the skill ID, e.g., "use aws-vpc to create a VPC". Pass parameters via JSON-like structures in your prompt, such as { "cidrBlock": "10.0.0.0/16" }. For programmatic access, integrate via OpenClaw's API by calling the skill endpoint with a payload like: { "action": "create-vpc", "params": { "cidr": "10.0.0.0/16" } }. Always ensure AWS credentials are set in environment variables like $AWS_ACCESS_KEY_ID and $AWS_SECRET_ACCESS_KEY before execution.

## Common Commands/API
Use AWS CLI for direct interactions; ensure the AWS CLI is installed and configured. For example:
- Create a VPC: `aws ec2 create-vpc --cidr-block 10.0.0.0/16 --tag-specifications 'ResourceType=vpc,Tags=[{Key=Name,Value=my-vpc}]'`
- Create a subnet: `aws ec2 create-subnet --vpc-id vpc-12345678 --cidr-block 10.0.1.0/24 --availability-zone us-east-1a`
API endpoints via AWS SDK:
- POST to https://ec2.amazonaws.com/ with action=CreateVpc and parameters like <?xml version="1.0"><CreateVpcRequest><CidrBlock>10.0.0.0/16</CidrBlock></CreateVpcRequest>
Config formats: Use JSON for SDK inputs, e.g., { "CidrBlock": "10.0.0.0/16" }. In OpenClaw, structure prompts as: "Execute aws-vpc action with params: { 'action': 'describe-vpcs' }".

## Integration Notes
Integrate this skill with other AWS services by chaining actions, e.g., create a VPC then launch an EC2 instance. Set environment variables for authentication: export AWS_ACCESS_KEY_ID=your_key; export AWS_SECRET_ACCESS_KEY=your_secret; export AWS_REGION=us-east-1. For OpenClaw integration, use the skill in multi-step workflows, like: first "aws-vpc create-vpc", then "aws-ec2 run-instances" with the VPC ID. Ensure IAM roles have permissions like ec2:CreateVpc in the policy JSON: { "Version": "2012-10-17", "Statement": [{ "Effect": "Allow", "Action": "ec2:*", "Resource": "*" }] }.

## Error Handling
Handle common errors by checking AWS response codes; for example, if "InvalidParameterValue" occurs, verify CIDR blocks (e.g., ensure no overlap). Use try-catch in scripts: try { aws ec2 create-vpc --cidr-block 10.0.0.0/16 } catch { echo "Error: $?"; exit 1 }. For permission issues (e.g., "UnauthorizedOperation"), ensure the IAM user has the required policy. In OpenClaw, parse error responses like { "errorCode": "AccessDenied", "message": "User not authorized" } and retry with corrected credentials. Log errors with details, e.g., aws ec2 describe-vpcs --output json > error.log if command fails.

## Concrete Usage Examples
1. Create a new VPC and a subnet: First, use "aws-vpc create-vpc with cidr: 10.0.0.0/16"; then "aws-vpc create-subnet with vpc-id: vpc-12345678 and cidr: 10.0.1.0/24". This isolates resources for a web application.
2. Configure security groups for a VPC: Execute "aws-vpc create-security-group with group-name: my-sg and vpc-id: vpc-12345678"; add rules with "aws-vpc authorize-security-group-ingress with group-id: sg-12345678 and protocol: tcp port: 80 cidr: 0.0.0.0/0". This secures inbound HTTP traffic.

## Graph Relationships
- Related to cluster: cloud-aws
- Connected via tags: aws-vpc, networking, cloud
- Links to other skills: integrates with aws-ec2 for instance launches, aws-lambda for serverless in VPCs, and aws-route53 for DNS routing within VPCs
