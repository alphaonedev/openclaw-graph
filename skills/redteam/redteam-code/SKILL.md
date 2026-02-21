---
name: redteam-code
cluster: redteam
description: "MANDATORY code security audit. SAST, secrets detection, auth flaws, CVE deps, crypto misuse, memory safety"
tags: ["code-audit", "sast", "secrets", "cve", "redteam"]
dependencies: ["redteam", "redteam-appsec"]
composes: []
similar_to: []
called_by: ["coding", "coding-python", "coding-node", "coding-javascript", "coding-typescript", "coding-swift", "coding-go", "coding-rust", "coding-kotlin", "coding-java", "coding-dart"]
manages: []
monitors: []
authorization_required: true
scope: authorized_testing_only
model_hint: claude-sonnet
embedding_hint: "code security audit sast secrets injection vulnerability cve scan"
---

# Redteam Code

## Purpose
MANDATORY code security audit. SAST, secrets detection, auth flaws, CVE deps, crypto misuse, memory safety

## When to Use
- When the task involves redteam code capabilities
- Match query: code security audit sast secrets injection vulnerability cve

## Key Capabilities
- MANDATORY code security audit. SAST, secrets detection, auth flaws, CVE deps, crypto misuse, memory safety

## Graph Relationships
- DEPENDS_ON: ["redteam", "redteam-appsec"]
- COMPOSES: []
- SIMILAR_TO: []
- CALLED_BY: ["coding", "coding-python", "coding-node", "coding-javascript", "coding-typescript", "coding-swift", "coding-go", "coding-rust", "coding-kotlin", "coding-java", "coding-dart"]
