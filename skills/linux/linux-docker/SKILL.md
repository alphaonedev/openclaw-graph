---
name: linux-docker
cluster: linux
description: "Docker/Compose: Dockerfile, networking, volumes, container lifecycle, registry, security hardening"
tags: ["docker", "containers", "compose", "registry"]
dependencies: ["linux-networking"]
composes: []
similar_to: []
called_by: []
manages: []
monitors: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "docker container dockerfile compose build run deploy registry"
---

# Linux Docker

## Purpose
Docker/Compose: Dockerfile, networking, volumes, container lifecycle, registry, security hardening

## When to Use
- When the task involves linux docker capabilities
- Match query: docker container dockerfile compose build run deploy registr

## Key Capabilities
- Docker/Compose: Dockerfile, networking, volumes, container lifecycle, registry, security hardening

## Graph Relationships
- DEPENDS_ON: ["linux-networking"]
- COMPOSES: []
- SIMILAR_TO: []
- CALLED_BY: []
