---
name: aws-vpc
cluster: cloud-aws
description: "Manage and configure Amazon Virtual Private Cloud for creating isolated, customizable network environments in AWS."
tags: ["aws-vpc","networking","cloud"]
dependencies: []
composes: []
similar_to: ["cs-networks"]
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "aws vpc virtual private cloud networking subnets security groups route tables"
---

# Aws Vpc

## Purpose
Manage and configure Amazon Virtual Private Cloud for creating isolated, customizable network environments in AWS.

## When to Use
- Isolate AWS resources in a private network
- Control inbound and outbound traffic for security
- Connect on-premises networks to AWS via VPN

## Key Capabilities
- Create and manage VPCs, subnets, and route tables
- Configure security groups and network ACLs
- Set up internet gateways and NAT devices

## Graph Relationships
- DEPENDS_ON: []
- COMPOSES: []
- SIMILAR_TO: ["cs-networks"]
