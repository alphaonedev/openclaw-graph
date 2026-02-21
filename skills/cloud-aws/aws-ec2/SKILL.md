---
name: aws-ec2
cluster: cloud-aws
description: "Manage and configure Amazon EC2 instances for scalable virtual servers and cloud computing resources."
tags: ["aws-ec2","virtual-machines","cloud-computing"]
dependencies: []
composes: []
similar_to: ["arch-cloud"]
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "aws ec2 instances virtual servers cloud computing"
---

# Aws Ec2

## Purpose
Manage and configure Amazon EC2 instances for scalable virtual servers and cloud computing resources.

## When to Use
- Launch scalable virtual servers for applications
- Handle dynamic compute needs like web hosting
- Run batch jobs or testing environments

## Key Capabilities
- Create, start, stop, and terminate EC2 instances
- Configure instance types, AMIs, and security groups
- Set up auto-scaling and load balancing for resources

## Graph Relationships
- DEPENDS_ON: []
- COMPOSES: []
- SIMILAR_TO: ["arch-cloud"]
