---
name: k8s
cluster: devops-sre
description: "Expertise in orchestrating and managing containerized applications at scale using Kubernetes."
tags: ["kubernetes","k8s","containers"]
dependencies: ["linux-docker"]
composes: []
similar_to: ["arch-cloud"]
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "kubernetes k8s containers orchestration pods services deployments"
---

# K8s

## Purpose
Expertise in orchestrating and managing containerized applications at scale using Kubernetes.

## When to Use
- Deploy scalable applications in containerized environments
- Manage microservices architecture in production
- Automate resource allocation and scaling

## Key Capabilities
- Orchestrate containers across multiple hosts
- Provide auto-scaling and self-healing features
- Enable service discovery and load balancing

## Graph Relationships
- DEPENDS_ON: ["linux-docker"]
- COMPOSES: []
- SIMILAR_TO: ["arch-cloud"]
