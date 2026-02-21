---
name: openclaw-admin
cluster: core-openclaw
description: "OpenClaw gateway management: start/stop/restart/update, config patches, compaction tuning, agent management"
tags: ["openclaw", "admin", "gateway", "config"]
dependencies: ["macos-launchd"]
composes: ["cron-ops"]
similar_to: []
called_by: []
manages: []
monitors: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "openclaw gateway restart update config compaction agent"
---

# Openclaw Admin

## Purpose
OpenClaw gateway management: start/stop/restart/update, config patches, compaction tuning, agent management

## When to Use
- When the task involves openclaw admin capabilities
- Match query: openclaw gateway restart update config compaction agent

## Key Capabilities
- OpenClaw gateway management: start/stop/restart/update, config patches, compaction tuning, agent management

## Graph Relationships
- DEPENDS_ON: ["macos-launchd"]
- COMPOSES: ["cron-ops"]
- SIMILAR_TO: []
- CALLED_BY: []
