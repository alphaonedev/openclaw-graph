---
name: model-deployment
cluster: aimlops
description: "Deploys machine learning models to production using containers and orchestration tools."
tags: ["mlops","deployment","containers"]
dependencies: ["linux-docker"]
composes: []
similar_to: ["arch-cloud"]
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "machine learning model deployment mlops containers kubernetes"
---

# Model Deployment

## Purpose
Deploys machine learning models to production using containers and orchestration tools.

## When to Use
- Deploying trained ML models to servers
- Scaling models in production
- Integrating models with CI/CD pipelines

## Key Capabilities
- Containerize models with Docker
- Orchestrate with Kubernetes
- Monitor and update deployed models

## Graph Relationships
- DEPENDS_ON: ["linux-docker"]
- COMPOSES: []
- SIMILAR_TO: ["arch-cloud"]
