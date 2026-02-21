---
name: redteam-appsec
cluster: redteam
description: "App security: OWASP Top 10 SQLi/XSS/SSRF/IDOR/XXE, Burp Suite, auth bypass, privilege escalation"
tags: ["appsec", "owasp", "burp", "sqli", "xss", "redteam"]
dependencies: ["redteam"]
composes: []
similar_to: []
called_by: []
manages: []
monitors: []
authorization_required: true
scope: authorized_testing_only
model_hint: claude-sonnet
embedding_hint: "application security owasp sql injection xss ssrf burp privilege"
---

# Redteam Appsec

## Purpose
App security: OWASP Top 10 SQLi/XSS/SSRF/IDOR/XXE, Burp Suite, auth bypass, privilege escalation

## When to Use
- When the task involves redteam appsec capabilities
- Match query: application security owasp sql injection xss ssrf burp privi

## Key Capabilities
- App security: OWASP Top 10 SQLi/XSS/SSRF/IDOR/XXE, Burp Suite, auth bypass, privilege escalation

## Graph Relationships
- DEPENDS_ON: ["redteam"]
- COMPOSES: []
- SIMILAR_TO: []
- CALLED_BY: []
