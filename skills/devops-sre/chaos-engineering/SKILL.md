---
name: chaos-engineering
cluster: devops-sre
description: "Introduces controlled failures to test and enhance system resilience in distributed environments."
tags: ["chaos-engineering","resilience","fault-injection"]
dependencies: []
composes: []
similar_to: ["testing"]
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "chaos engineering fault injection resilience testing distributed systems"
---

# Chaos Engineering

## Purpose
Introduces controlled failures to test and enhance system resilience in distributed environments.

## When to Use
- To test system reliability in production-like environments
- For identifying weaknesses in distributed architectures
- During SRE practices to improve fault tolerance

## Key Capabilities
- Simulate network failures and latency
- Inject resource exhaustion like CPU or memory
- Analyze recovery mechanisms and system behavior

## Graph Relationships
- DEPENDS_ON: []
- COMPOSES: []
- SIMILAR_TO: ["testing"]
