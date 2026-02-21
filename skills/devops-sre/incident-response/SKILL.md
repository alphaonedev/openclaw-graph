---
name: incident-response
cluster: devops-sre
description: "Manages detection, analysis, containment, and recovery of security incidents in DevOps environments."
tags: ["incident-response","security","devops"]
dependencies: []
composes: []
similar_to: ["redteam"]
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "incident response security devops sre monitoring detection recovery"
---

# Incident Response

## Purpose
Manages detection, analysis, containment, and recovery of security incidents in DevOps environments.

## When to Use
- when a security breach is detected
- during system outages or failures
- for post-incident analysis and improvement

## Key Capabilities
- detect anomalies in logs and systems
- analyze and contain incidents
- recover services and perform root cause analysis

## Graph Relationships
- DEPENDS_ON: []
- COMPOSES: []
- SIMILAR_TO: ["redteam"]
