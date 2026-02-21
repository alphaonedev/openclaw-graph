---
name: gcp-cloud-run
cluster: cloud-gcp
description: "Deploy and manage stateless containers on Google's serverless platform for scalable web applications."
tags: ["gcp","cloud-run","serverless"]
dependencies: ["linux-docker"]
composes: []
similar_to: ["arch-cloud"]
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "gcp cloud run serverless containers deployment scaling gcp services"
---

# Gcp Cloud Run

## Purpose
Deploy and manage stateless containers on Google's serverless platform for scalable web applications.

## When to Use
- Deploy containerized apps without managing servers
- Build scalable APIs and web services
- Integrate with GCP for event-driven architectures

## Key Capabilities
- Run and scale containers automatically
- Handle HTTP requests with built-in load balancing
- Connect to GCP services like Cloud Storage and Pub/Sub

## Graph Relationships
- DEPENDS_ON: ["linux-docker"]
- COMPOSES: []
- SIMILAR_TO: ["arch-cloud"]
