---
name: arch-microservices
cluster: se-architecture
description: "Microservices: decomposition, API gateway Kong/Traefik, service mesh Istio, circuit breakers, saga/outbox"
tags: ["microservices", "api-gateway", "service-mesh", "architecture"]
dependencies: ["arch", "arch-distributed"]
composes: ["linux-docker"]
similar_to: []
called_by: []
manages: []
monitors: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "microservices api gateway service mesh circuit breaker saga istio"
---

# Arch Microservices

## Purpose
Microservices: decomposition, API gateway Kong/Traefik, service mesh Istio, circuit breakers, saga/outbox

## When to Use
- When the task involves arch microservices capabilities
- Match query: microservices api gateway service mesh circuit breaker saga 

## Key Capabilities
- Microservices: decomposition, API gateway Kong/Traefik, service mesh Istio, circuit breakers, saga/outbox

## Graph Relationships
- DEPENDS_ON: ["arch", "arch-distributed"]
- COMPOSES: ["linux-docker"]
- SIMILAR_TO: []
- CALLED_BY: []
