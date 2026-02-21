---
name: web-security
cluster: web-dev
description: "OWASP Top 10, CSP, CORS, XSS/CSRF prevention, auth patterns, dependency scanning"
tags: ["security", "owasp", "csp", "cors", "web"]
dependencies: ["web"]
composes: ["redteam-appsec"]
similar_to: []
called_by: []
manages: []
monitors: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "web security owasp xss csrf csp cors authentication injection"
---

# Web Security

## Purpose
OWASP Top 10, CSP, CORS, XSS/CSRF prevention, auth patterns, dependency scanning

## When to Use
- When the task involves web security capabilities
- Match query: web security owasp xss csrf csp cors authentication injectio

## Key Capabilities
- OWASP Top 10, CSP, CORS, XSS/CSRF prevention, auth patterns, dependency scanning

## Graph Relationships
- DEPENDS_ON: ["web"]
- COMPOSES: ["redteam-appsec"]
- SIMILAR_TO: []
- CALLED_BY: []
