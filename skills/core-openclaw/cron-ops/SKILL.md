---
name: cron-ops
cluster: core-openclaw
description: "Cron job lifecycle: create, update, remove, debug, fix false positives, sanitize payloads"
tags: ["cron", "jobs", "automation", "scheduling"]
dependencies: ["openclaw-admin"]
composes: []
similar_to: []
called_by: []
manages: []
monitors: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "cron job create update delete debug schedule automation"
---

# Cron Ops

## Purpose
Cron job lifecycle: create, update, remove, debug, fix false positives, sanitize payloads

## When to Use
- When the task involves cron ops capabilities
- Match query: cron job create update delete debug schedule automation

## Key Capabilities
- Cron job lifecycle: create, update, remove, debug, fix false positives, sanitize payloads

## Graph Relationships
- DEPENDS_ON: ["openclaw-admin"]
- COMPOSES: []
- SIMILAR_TO: []
- CALLED_BY: []
