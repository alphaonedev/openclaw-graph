---
name: aws-ecs
cluster: cloud-aws
description: "Orchestrate and manage Docker containers on AWS using Amazon Elastic Container Service for scalable applications."
tags: ["aws","ecs","container"]
dependencies: []
composes: []
similar_to: ["linux-docker"]
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "aws ecs container orchestration docker aws-cloud"
---

# Aws Ecs

## Purpose
Orchestrate and manage Docker containers on AWS using Amazon Elastic Container Service for scalable applications.

## When to Use
- Deploy and scale containerized applications on AWS
- Run microservices architecture with high availability
- Integrate ECS with other AWS services like ECR and ALB

## Key Capabilities
- Run and manage Docker containers at scale
- Automatic scaling and load balancing for containers
- Integration with AWS services for monitoring and networking

## Graph Relationships
- DEPENDS_ON: []
- COMPOSES: []
- SIMILAR_TO: ["linux-docker"]
