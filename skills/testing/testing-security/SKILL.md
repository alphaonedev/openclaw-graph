---
name: testing-security
cluster: testing
description: "Security test: DAST OWASP ZAP/Nuclei, SAST Semgrep/Bandit, Snyk/Trivy, detect-secrets/TruffleHog"
tags: ["security-test", "dast", "sast", "snyk", "testing"]
dependencies: ["testing", "redteam-code"]
composes: ["redteam-code"]
similar_to: []
called_by: []
manages: []
monitors: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "security test dast sast sca snyk trivy secrets scanning zap nuclei"
---

# Testing Security

## Purpose
Security test: DAST OWASP ZAP/Nuclei, SAST Semgrep/Bandit, Snyk/Trivy, detect-secrets/TruffleHog

## When to Use
- When the task involves testing security capabilities
- Match query: security test dast sast sca snyk trivy secrets scanning zap 

## Key Capabilities
- Security test: DAST OWASP ZAP/Nuclei, SAST Semgrep/Bandit, Snyk/Trivy, detect-secrets/TruffleHog

## Graph Relationships
- DEPENDS_ON: ["testing", "redteam-code"]
- COMPOSES: ["redteam-code"]
- SIMILAR_TO: []
- CALLED_BY: []
