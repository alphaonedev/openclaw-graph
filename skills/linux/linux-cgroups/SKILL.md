---
name: linux-cgroups
cluster: linux
description: "cgroups v2: memory limits per OpenClaw instance, CPU quotas, OOM protection, systemd slices"
tags: ["cgroups", "memory", "limits", "linux", "performance"]
dependencies: ["linux-systemd"]
composes: []
similar_to: []
called_by: []
manages: []
monitors: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "cgroups memory limits cpu quota oom linux resource control slice"
---

# Linux Cgroups

## Purpose
cgroups v2: memory limits per OpenClaw instance, CPU quotas, OOM protection, systemd slices

## When to Use
- When the task involves linux cgroups capabilities
- Match query: cgroups memory limits cpu quota oom linux resource control s

## Key Capabilities
- cgroups v2: memory limits per OpenClaw instance, CPU quotas, OOM protection, systemd slices

## Graph Relationships
- DEPENDS_ON: ["linux-systemd"]
- COMPOSES: []
- SIMILAR_TO: []
- CALLED_BY: []
