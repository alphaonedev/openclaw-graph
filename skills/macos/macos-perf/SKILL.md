---
name: macos-perf
cluster: macos
description: "Activity Monitor, Instruments, top/htop, memory pressure, thermal state, powermetrics, profiling"
tags: ["performance", "profiling", "macos", "instruments"]
dependencies: ["macos-admin"]
composes: []
similar_to: []
called_by: []
manages: []
monitors: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "macos performance profiling instruments memory cpu thermal powermetrics"
---

# Macos Perf

## Purpose
Activity Monitor, Instruments, top/htop, memory pressure, thermal state, powermetrics, profiling

## When to Use
- When the task involves macos perf capabilities
- Match query: macos performance profiling instruments memory cpu thermal p

## Key Capabilities
- Activity Monitor, Instruments, top/htop, memory pressure, thermal state, powermetrics, profiling

## Graph Relationships
- DEPENDS_ON: ["macos-admin"]
- COMPOSES: []
- SIMILAR_TO: []
- CALLED_BY: []
