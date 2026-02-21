---
name: orchestrator
cluster: distributed-comms
description: "Multi-instance delegation: route to A-H instances, fanout/aggregation, sessions_send/spawn, health checks"
tags: ["orchestrator", "multi-instance", "delegation", "sessions"]
dependencies: ["node-ops", "session-mesh"]
composes: []
similar_to: []
called_by: []
manages: []
monitors: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "orchestrate delegate multi-instance session spawn send fanout aggregate instances"
---

# Orchestrator

## Purpose
Multi-instance delegation: route to A-H instances, fanout/aggregation, sessions_send/spawn, health checks

## When to Use
- When the task involves orchestrator capabilities
- Match query: orchestrate delegate multi-instance session spawn send fanou

## Key Capabilities
- Multi-instance delegation: route to A-H instances, fanout/aggregation, sessions_send/spawn, health checks

## Graph Relationships
- DEPENDS_ON: ["node-ops", "session-mesh"]
- COMPOSES: []
- SIMILAR_TO: []
- CALLED_BY: []
