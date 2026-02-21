---
name: redteam-reporting
cluster: redteam
description: "Security findings: CVSS 3.1/4.0, executive summaries, technical reports, remediation, disclosure"
tags: ["reporting", "cvss", "findings", "remediation", "redteam"]
dependencies: ["redteam"]
composes: []
similar_to: []
called_by: []
manages: []
monitors: []
authorization_required: true
scope: authorized_testing_only
model_hint: claude-sonnet
embedding_hint: "security report cvss findings remediation executive summary disclosure"
---

# Redteam Reporting

## Purpose
Security findings: CVSS 3.1/4.0, executive summaries, technical reports, remediation, disclosure

## When to Use
- When the task involves redteam reporting capabilities
- Match query: security report cvss findings remediation executive summary 

## Key Capabilities
- Security findings: CVSS 3.1/4.0, executive summaries, technical reports, remediation, disclosure

## Graph Relationships
- DEPENDS_ON: ["redteam"]
- COMPOSES: []
- SIMILAR_TO: []
- CALLED_BY: []
